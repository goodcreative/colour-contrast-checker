import contrastRatio from '@/composables/calculateColourContrast.js';
import apcaContrast from '@/composables/calculateAPCAContrast.js';
import simulateCVD from '@/composables/simulateCVD.js';
import { contrastConfig } from '@/config/contrastConfig.js';

/**
 * Builds categorized colour combinations from a palette.
 *
 * Generates unique pairs, applies CVD simulation, calculates contrast ratios
 * (WCAG or APCA), and buckets into pass/largePass/fail by threshold.
 *
 * @param {Object} options
 * @param {string[]} options.swatches        - hex colour array
 * @param {'wcag'|'apca'} options.contrastMode
 * @param {'aa'|'aaa'} options.complianceLevel
 * @param {'normal'|'protanopia'|'deuteranopia'|'tritanopia'} options.cvdMode
 * @param {string|null} options.focusColour  - hex string or null
 *
 * @returns {{ pass: [string, string, number][], largePass: [string, string, number][], fail: [string, string, number][] }}
 */
export function buildCategorizedCombinations({ swatches, contrastMode, complianceLevel, cvdMode, focusColour }) {
  const categories = { pass: [], largePass: [], fail: [] };
  if (swatches.length < 2) return categories;

  const thresholds = contrastConfig[contrastMode]?.[complianceLevel.toLowerCase()];
  if (!thresholds) return categories;

  // Build CVD simulation map
  const simMap = new Map(swatches.map(h => [h, simulateCVD(h, cvdMode)]));

  // Generate unique pairs
  const seenPairs = new Map();
  const colours = [...swatches];
  const primarySet = focusColour ? [focusColour] : colours;
  const calcFn = contrastMode === 'apca' ? apcaContrast : contrastRatio;

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

      const combo = [pair[0], pair[1], ratio];

      if (ratio >= thresholds.max) {
        categories.pass.push(combo);
      } else if (ratio >= thresholds.min) {
        categories.largePass.push(combo);
      } else {
        categories.fail.push(combo);
      }
    });
  });

  const compare = (a, b) => b[2] - a[2];
  categories.pass.sort(compare);
  categories.largePass.sort(compare);
  categories.fail.sort(compare);

  return categories;
}
