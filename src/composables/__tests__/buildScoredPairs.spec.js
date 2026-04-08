import { describe, it, expect } from 'vitest';
import { buildScoredPairs } from '../buildCategorizedCombinations.js';

const BLACK = '#000000';
const WHITE = '#ffffff';
const MID_GRAY = '#888888';
const RED = '#ff0000';
const GREEN = '#00ff00';

const defaults = { contrastMode: 'wcag', cvdMode: 'normal', focusColour: null };

describe('buildScoredPairs', () => {
  it('returns a flat array', () => {
    const result = buildScoredPairs({ swatches: [BLACK, WHITE], ...defaults });
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveLength(3);
  });

  it('empty swatches returns []', () => {
    expect(buildScoredPairs({ swatches: [], ...defaults })).toEqual([]);
  });

  it('single swatch returns []', () => {
    expect(buildScoredPairs({ swatches: [BLACK], ...defaults })).toEqual([]);
  });

  it('two swatches returns one tuple', () => {
    const result = buildScoredPairs({ swatches: [BLACK, WHITE], ...defaults });
    expect(result).toHaveLength(1);
  });

  it('three swatches returns three unique pairs', () => {
    const result = buildScoredPairs({ swatches: [BLACK, WHITE, MID_GRAY], ...defaults });
    expect(result).toHaveLength(3);
  });

  it('does not produce reversed duplicates', () => {
    const result = buildScoredPairs({ swatches: [BLACK, WHITE], ...defaults });
    expect(result).toHaveLength(1);
  });

  it('tuple is [colourA, colourB, ratio]', () => {
    const result = buildScoredPairs({ swatches: [BLACK, WHITE], ...defaults });
    expect(typeof result[0][0]).toBe('string');
    expect(typeof result[0][1]).toBe('string');
    expect(typeof result[0][2]).toBe('number');
  });

  it('WCAG black/white ratio is 21', () => {
    const result = buildScoredPairs({ swatches: [BLACK, WHITE], ...defaults });
    expect(result[0][2]).toBe(21);
  });

  it('WCAG ratios rounded to 2 decimal places', () => {
    const result = buildScoredPairs({ swatches: [BLACK, MID_GRAY], ...defaults });
    const decimals = (result[0][2].toString().split('.')[1] || '').length;
    expect(decimals).toBeLessThanOrEqual(2);
  });

  it('APCA ratios rounded to 1 decimal place', () => {
    const result = buildScoredPairs({
      swatches: [BLACK, MID_GRAY],
      contrastMode: 'apca',
      cvdMode: 'normal',
      focusColour: null,
    });
    const decimals = (result[0][2].toString().split('.')[1] || '').length;
    expect(decimals).toBeLessThanOrEqual(1);
  });

  it('APCA black/white ratio > 100', () => {
    const result = buildScoredPairs({
      swatches: [BLACK, WHITE],
      contrastMode: 'apca',
      cvdMode: 'normal',
      focusColour: null,
    });
    expect(result[0][2]).toBeGreaterThan(100);
  });

  describe('focus colour', () => {
    it('only returns pairs involving the focus colour', () => {
      const result = buildScoredPairs({
        swatches: [BLACK, WHITE, MID_GRAY],
        ...defaults,
        focusColour: WHITE,
      });
      expect(result).toHaveLength(2);
      result.forEach(tuple => expect(tuple).toContain(WHITE));
    });

    it('focus colour is always first in the tuple', () => {
      const result = buildScoredPairs({
        swatches: [BLACK, WHITE],
        ...defaults,
        focusColour: WHITE,
      });
      expect(result[0][0]).toBe(WHITE);
    });
  });

  describe('CVD simulation', () => {
    it('normal mode — black/white ratio is 21', () => {
      const result = buildScoredPairs({ swatches: [BLACK, WHITE], ...defaults, cvdMode: 'normal' });
      expect(result[0][2]).toBe(21);
    });

    it('protanopia shifts ratio for chromatic pair', () => {
      const normal = buildScoredPairs({ swatches: [RED, GREEN], ...defaults, cvdMode: 'normal' });
      const protan = buildScoredPairs({ swatches: [RED, GREEN], ...defaults, cvdMode: 'protanopia' });
      expect(protan[0][2]).not.toBe(normal[0][2]);
    });
  });
});
