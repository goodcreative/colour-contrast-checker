import contrastRatio from '@/composables/calculateColourContrast.js';
import apcaContrast from '@/composables/calculateAPCAContrast.js';
import simulateCVD from '@/composables/simulateCVD.js';
import { contrastConfig } from '@/config/contrastConfig.js';

/**
 * Stage 1: Generate unique colour pairs, apply CVD simulation, and calculate
 * contrast ratios. Pure scoring — no bucketing by threshold.
 *
 * Depends on: swatches, contrastMode, cvdMode, focusColour
 * Does NOT depend on: complianceLevel
 *
 * @param {Object} options
 * @param {string[]} options.swatches
 * @param {'wcag'|'apca'} options.contrastMode
 * @param {'normal'|'protanopia'|'deuteranopia'|'tritanopia'} options.cvdMode
 * @param {string|null} options.focusColour
 *
 * @returns {Array<[string, string, number]>} Flat array of [colA, colB, ratio] tuples
 */
export function buildScoredPairs({ swatches, contrastMode, cvdMode, focusColour }) {
  if (swatches.length < 2) return [];

  const simMap = new Map(swatches.map(h => [h, simulateCVD(h, cvdMode)]));
  const seenPairs = new Map();
  const colours = [...swatches];
  const primarySet = focusColour ? [focusColour] : colours;
  const calcFn = contrastMode === 'apca' ? apcaContrast : contrastRatio;
  const scored = [];

  primarySet.forEach((first) => {
    colours.forEach((second) => {
      if (first === second) return;

      const sortedPair = [first, second].sort();
      const key = sortedPair.join('-');
      if (seenPairs.has(key)) return;
      seenPairs.set(key, true);

      const pair = focusColour ? [first, second] : sortedPair;
      const simFirst = simMap.get(pair[0]) ?? pair[0];
      const simSecond = simMap.get(pair[1]) ?? pair[1];

      const ratio = contrastMode === 'apca'
        ? calcFn(simFirst, simSecond)
        : Math.round(calcFn(simFirst, simSecond) * 100) / 100;

      scored.push([pair[0], pair[1], ratio]);
    });
  });

  return scored;
}

/**
 * Stage 2: Bucket pre-scored pairs into pass/largePass/fail by compliance
 * thresholds, then sort each bucket by ratio descending.
 *
 * Depends on: scoredPairs, contrastMode (config key), complianceLevel
 * Does NOT run any colour math.
 *
 * @param {Object} options
 * @param {Array<[string, string, number]>} options.scoredPairs
 * @param {'wcag'|'apca'} options.contrastMode
 * @param {'aa'|'aaa'|'AA'|'AAA'} options.complianceLevel
 *
 * @returns {{ pass: [string, string, number][], largePass: [string, string, number][], fail: [string, string, number][] }}
 */
export function categorizeScoredPairs({ scoredPairs, contrastMode, complianceLevel }) {
  const categories = { pass: [], largePass: [], fail: [] };
  const thresholds = contrastConfig[contrastMode]?.[complianceLevel.toLowerCase()];
  if (!thresholds) return categories;

  for (const combo of scoredPairs) {
    const ratio = combo[2];
    if (ratio >= thresholds.max)      categories.pass.push(combo);
    else if (ratio >= thresholds.min) categories.largePass.push(combo);
    else                              categories.fail.push(combo);
  }

  const compare = (a, b) => b[2] - a[2];
  categories.pass.sort(compare);
  categories.largePass.sort(compare);
  categories.fail.sort(compare);

  return categories;
}

/**
 * Convenience wrapper: scores all pairs then buckets them in one call.
 * Note: callers needing Vue computed caching across complianceLevel changes
 * should use buildScoredPairs + categorizeScoredPairs as two separate
 * computed() layers instead of this wrapper.
 *
 * @param {Object} options
 * @param {string[]} options.swatches
 * @param {'wcag'|'apca'} options.contrastMode
 * @param {'aa'|'aaa'|'AA'|'AAA'} options.complianceLevel
 * @param {'normal'|'protanopia'|'deuteranopia'|'tritanopia'} options.cvdMode
 * @param {string|null} options.focusColour
 *
 * @returns {{ pass: [string, string, number][], largePass: [string, string, number][], fail: [string, string, number][] }}
 */
export function buildCategorizedCombinations({ swatches, contrastMode, complianceLevel, cvdMode, focusColour }) {
  const scored = buildScoredPairs({ swatches, contrastMode, cvdMode, focusColour });
  return categorizeScoredPairs({ scoredPairs: scored, contrastMode, complianceLevel });
}
