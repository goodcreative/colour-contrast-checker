import { describe, it, expect } from 'vitest';
import { buildCategorizedCombinations } from '../buildCategorizedCombinations.js';

const BLACK = '#000000';
const WHITE = '#ffffff';
const MID_GRAY = '#888888';
const LIGHT_GRAY = '#aaaaaa';

const defaults = {
  contrastMode: 'wcag',
  complianceLevel: 'aa',
  cvdMode: 'normal',
  focusColour: null,
};

describe('buildCategorizedCombinations', () => {
  // --- Return shape ---

  it('returns { pass, largePass, fail } arrays', () => {
    const result = buildCategorizedCombinations({ swatches: [], ...defaults });
    expect(result).toEqual({ pass: [], largePass: [], fail: [] });
  });

  // --- Edge cases ---

  it('empty swatches returns empty buckets', () => {
    const result = buildCategorizedCombinations({ swatches: [], ...defaults });
    expect(result.pass).toHaveLength(0);
    expect(result.largePass).toHaveLength(0);
    expect(result.fail).toHaveLength(0);
  });

  it('single swatch returns empty buckets (no pairs)', () => {
    const result = buildCategorizedCombinations({ swatches: [BLACK], ...defaults });
    expect(result.pass).toHaveLength(0);
  });

  // --- WCAG bucketing ---

  describe('WCAG AA bucketing', () => {
    it('black/white (21:1) → pass', () => {
      const result = buildCategorizedCombinations({
        swatches: [BLACK, WHITE],
        ...defaults,
      });
      expect(result.pass).toHaveLength(1);
      expect(result.pass[0][0]).toBe(BLACK);
      expect(result.pass[0][1]).toBe(WHITE);
      expect(result.pass[0][2]).toBeGreaterThanOrEqual(4.5);
    });

    it('mid-gray/white (3.55:1) → largePass (≥3, <4.5)', () => {
      const result = buildCategorizedCombinations({
        swatches: [MID_GRAY, WHITE],
        ...defaults,
      });
      expect(result.largePass).toHaveLength(1);
      expect(result.largePass[0][2]).toBeGreaterThanOrEqual(3);
      expect(result.largePass[0][2]).toBeLessThan(4.5);
    });

    it('light-gray/white (2.32:1) → fail (<3)', () => {
      const result = buildCategorizedCombinations({
        swatches: [LIGHT_GRAY, WHITE],
        ...defaults,
      });
      expect(result.fail).toHaveLength(1);
      expect(result.fail[0][2]).toBeLessThan(3);
    });
  });

  describe('WCAG AAA bucketing', () => {
    it('black/white (21:1) → pass (≥7)', () => {
      const result = buildCategorizedCombinations({
        swatches: [BLACK, WHITE],
        contrastMode: 'wcag',
        complianceLevel: 'aaa',
        cvdMode: 'normal',
        focusColour: null,
      });
      expect(result.pass).toHaveLength(1);
    });

    it('mid-gray/white (3.55:1) → fail at AAA (<4.5 min)', () => {
      const result = buildCategorizedCombinations({
        swatches: [MID_GRAY, WHITE],
        contrastMode: 'wcag',
        complianceLevel: 'aaa',
        cvdMode: 'normal',
        focusColour: null,
      });
      expect(result.fail).toHaveLength(1);
    });
  });

  // --- APCA bucketing ---

  describe('APCA AA bucketing', () => {
    it('black/white (Lc~108) → pass (≥60)', () => {
      const result = buildCategorizedCombinations({
        swatches: [BLACK, WHITE],
        contrastMode: 'apca',
        complianceLevel: 'aa',
        cvdMode: 'normal',
        focusColour: null,
      });
      expect(result.pass).toHaveLength(1);
      expect(result.pass[0][2]).toBeGreaterThanOrEqual(60);
    });

    it('#999999/white (Lc~54) → largePass (≥45, <60)', () => {
      const result = buildCategorizedCombinations({
        swatches: ['#999999', WHITE],
        contrastMode: 'apca',
        complianceLevel: 'aa',
        cvdMode: 'normal',
        focusColour: null,
      });
      expect(result.largePass).toHaveLength(1);
    });

    it('#bbbbbb/white (Lc~37) → fail (<45)', () => {
      const result = buildCategorizedCombinations({
        swatches: ['#bbbbbb', WHITE],
        contrastMode: 'apca',
        complianceLevel: 'aa',
        cvdMode: 'normal',
        focusColour: null,
      });
      expect(result.fail).toHaveLength(1);
    });
  });

  // --- Deduplication ---

  it('does not produce reversed duplicates', () => {
    const result = buildCategorizedCombinations({
      swatches: [BLACK, WHITE],
      ...defaults,
    });
    const total = result.pass.length + result.largePass.length + result.fail.length;
    expect(total).toBe(1);
  });

  it('3 swatches → 3 unique pairs', () => {
    const result = buildCategorizedCombinations({
      swatches: [BLACK, WHITE, MID_GRAY],
      ...defaults,
    });
    const total = result.pass.length + result.largePass.length + result.fail.length;
    expect(total).toBe(3);
  });

  // --- Focus colour ---

  describe('focus colour filtering', () => {
    it('only returns pairs involving the focus colour', () => {
      const result = buildCategorizedCombinations({
        swatches: [BLACK, WHITE, MID_GRAY],
        ...defaults,
        focusColour: WHITE,
      });
      const total = result.pass.length + result.largePass.length + result.fail.length;
      expect(total).toBe(2); // WHITE-BLACK, WHITE-MID_GRAY
    });

    it('focus colour is always first in the pair', () => {
      const result = buildCategorizedCombinations({
        swatches: [BLACK, WHITE],
        ...defaults,
        focusColour: WHITE,
      });
      const allCombos = [...result.pass, ...result.largePass, ...result.fail];
      allCombos.forEach(combo => {
        expect(combo[0]).toBe(WHITE);
      });
    });
  });

  // --- CVD simulation ---

  describe('CVD simulation', () => {
    it('normal mode produces same results as no simulation', () => {
      const normal = buildCategorizedCombinations({
        swatches: [BLACK, WHITE],
        ...defaults,
        cvdMode: 'normal',
      });
      expect(normal.pass).toHaveLength(1);
    });

    it('protanopia mode changes contrast ratios for coloured swatches', () => {
      const red = '#ff0000';
      const green = '#00ff00';

      const normal = buildCategorizedCombinations({
        swatches: [red, green],
        ...defaults,
        cvdMode: 'normal',
      });
      const protan = buildCategorizedCombinations({
        swatches: [red, green],
        ...defaults,
        cvdMode: 'protanopia',
      });

      const normalRatio = [...normal.pass, ...normal.largePass, ...normal.fail][0][2];
      const protanRatio = [...protan.pass, ...protan.largePass, ...protan.fail][0][2];
      expect(protanRatio).not.toBe(normalRatio);
    });
  });

  // --- Sorting ---

  it('results within each bucket are sorted by ratio descending', () => {
    // Use 4 colours to get multiple combos in same bucket
    const result = buildCategorizedCombinations({
      swatches: [BLACK, '#111111', '#222222', '#333333'],
      ...defaults,
    });
    // All dark-on-dark pairs will be fail bucket
    const ratios = result.fail.map(c => c[2]);
    for (let i = 1; i < ratios.length; i++) {
      expect(ratios[i]).toBeLessThanOrEqual(ratios[i - 1]);
    }
  });

  // --- WCAG rounding ---

  it('WCAG ratios are rounded to 2 decimal places', () => {
    const result = buildCategorizedCombinations({
      swatches: [BLACK, MID_GRAY],
      ...defaults,
    });
    const allCombos = [...result.pass, ...result.largePass, ...result.fail];
    const ratio = allCombos[0][2];
    const decimalPlaces = (ratio.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });

  // --- APCA rounding ---

  it('APCA ratios are rounded to 1 decimal place', () => {
    const result = buildCategorizedCombinations({
      swatches: [BLACK, MID_GRAY],
      contrastMode: 'apca',
      complianceLevel: 'aa',
      cvdMode: 'normal',
      focusColour: null,
    });
    const allCombos = [...result.pass, ...result.largePass, ...result.fail];
    const ratio = allCombos[0][2];
    const decimalPlaces = (ratio.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });
});
