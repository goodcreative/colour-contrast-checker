import contrastRatio from '@/composables/calculateColourContrast';
import apcaContrast from '@/composables/calculateAPCAContrast';
import simulateCVD from '@/composables/simulateCVD';
import { contrastConfig } from '@/config/contrastConfig';
import type { ContrastAlgorithm, CVDType, ComplianceLevel } from '@/config/contrastSettings';

/** A single scored foreground/background pair. */
export interface ScoredPair {
  fgHex: string;
  bgHex: string;
  score: number;
  simulatedFg: string;
  simulatedBg: string;
}

export interface ScorePairOptions {
  mode?: ContrastAlgorithm;
  cvdMode?: CVDType;
}

export interface ScoreAllPairsOptions extends ScorePairOptions {
  focusColour?: string | null;
}

export interface CategorizeOptions {
  mode?: ContrastAlgorithm;
  complianceLevel?: ComplianceLevel;
}

export interface CategorizedPairs {
  pass: ScoredPair[];
  partial: ScoredPair[];
  fail: ScoredPair[];
}

/**
 * Score a single colour pair. Core atom — all other functions delegate to this.
 */
export function scoreColourPair(
  hexFg: string,
  hexBg: string,
  opts: ScorePairOptions = {},
): Pick<ScoredPair, 'score' | 'simulatedFg' | 'simulatedBg'> {
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
 */
export function scoreAllPairs(
  swatches: string[],
  opts: ScoreAllPairsOptions = {},
): ScoredPair[] {
  const { mode = 'wcag', cvdMode = 'normal', focusColour = null } = opts;
  if (swatches.length < 2) return [];

  const seenPairs = new Map<string, boolean>();
  const primarySet = focusColour ? [focusColour] : swatches;
  const result: ScoredPair[] = [];

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
 */
export function categorizePairs(
  scoredPairs: ScoredPair[],
  opts: CategorizeOptions = {},
): CategorizedPairs {
  const { mode = 'wcag', complianceLevel = 'AA' } = opts;
  const categories: CategorizedPairs = { pass: [], partial: [], fail: [] };
  const thresholds = contrastConfig[mode]?.[complianceLevel.toLowerCase()];
  if (!thresholds) return categories;

  for (const pair of scoredPairs) {
    if (pair.score >= thresholds.max)      categories.pass.push(pair);
    else if (pair.score >= thresholds.min) categories.partial.push(pair);
    else                                   categories.fail.push(pair);
  }

  const byScoreDesc = (a: ScoredPair, b: ScoredPair) => b.score - a.score;
  categories.pass.sort(byScoreDesc);
  categories.partial.sort(byScoreDesc);
  categories.fail.sort(byScoreDesc);

  return categories;
}
