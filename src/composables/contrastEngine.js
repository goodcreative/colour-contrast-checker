import contrastRatio from '@/composables/calculateColourContrast.js';
import apcaContrast from '@/composables/calculateAPCAContrast.js';
import simulateCVD from '@/composables/simulateCVD.js';
import { contrastConfig } from '@/config/contrastConfig.js';

/**
 * Score a single colour pair. Core atom — all other functions delegate to this.
 *
 * @param {string} hexFg
 * @param {string} hexBg
 * @param {{ mode?: 'wcag'|'apca', cvdMode?: 'normal'|'protanopia'|'deuteranopia'|'tritanopia' }} [opts]
 * @returns {{ score: number, simulatedFg: string, simulatedBg: string }}
 */
export function scoreColourPair(hexFg, hexBg, opts = {}) {
  const { mode = 'wcag', cvdMode = 'normal' } = opts;
  const simulatedFg = simulateCVD(hexFg, cvdMode);
  const simulatedBg = simulateCVD(hexBg, cvdMode);

  const score = mode === 'apca'
    ? apcaContrast(simulatedFg, simulatedBg)
    : Math.round(contrastRatio(simulatedFg, simulatedBg) * 100) / 100;

  return { score, simulatedFg, simulatedBg };
}

/**
 * Score all unique pairs in a palette. Implemented as a loop over scoreColourPair.
 *
 * @param {string[]} swatches
 * @param {{ mode?: string, cvdMode?: string, focusColour?: string|null }} [opts]
 * @returns {Array<{ fgHex: string, bgHex: string, score: number, simulatedFg: string, simulatedBg: string }>}
 */
export function scoreAllPairs(swatches, opts = {}) {
  const { mode = 'wcag', cvdMode = 'normal', focusColour = null } = opts;
  if (swatches.length < 2) return [];

  const seenPairs = new Map();
  const primarySet = focusColour ? [focusColour] : swatches;
  const result = [];

  primarySet.forEach(first => {
    swatches.forEach(second => {
      if (first === second) return;

      const sortedPair = [first, second].sort();
      const key = sortedPair.join('-');
      if (seenPairs.has(key)) return;
      seenPairs.set(key, true);

      const [fgHex, bgHex] = focusColour ? [first, second] : sortedPair;
      const { score, simulatedFg, simulatedBg } = scoreColourPair(fgHex, bgHex, { mode, cvdMode });

      result.push({ fgHex, bgHex, score, simulatedFg, simulatedBg });
    });
  });

  return result;
}

/**
 * Bin pre-scored pairs into pass/partial/fail. Cheap re-categorization without re-scoring.
 *
 * @param {ReturnType<typeof scoreAllPairs>} scoredPairs
 * @param {{ mode?: string, complianceLevel?: 'AA'|'AAA' }} [opts]
 * @returns {{ pass: object[], partial: object[], fail: object[] }}
 */
export function categorizePairs(scoredPairs, opts = {}) {
  const { mode = 'wcag', complianceLevel = 'AA' } = opts;
  const categories = { pass: [], partial: [], fail: [] };
  const thresholds = contrastConfig[mode]?.[complianceLevel.toLowerCase()];
  if (!thresholds) return categories;

  for (const pair of scoredPairs) {
    if (pair.score >= thresholds.max)      categories.pass.push(pair);
    else if (pair.score >= thresholds.min) categories.partial.push(pair);
    else                                   categories.fail.push(pair);
  }

  const byScoreDesc = (a, b) => b.score - a.score;
  categories.pass.sort(byScoreDesc);
  categories.partial.sort(byScoreDesc);
  categories.fail.sort(byScoreDesc);

  return categories;
}
