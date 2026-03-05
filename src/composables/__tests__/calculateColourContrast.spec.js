import { describe, it, expect } from 'vitest';
import contrastRatio from '../calculateColourContrast.js';

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBe(21);
  });

  it('returns 21 regardless of argument order', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBe(21);
  });

  it('returns 1 for identical colours', () => {
    expect(contrastRatio('#777777', '#777777')).toBe(1);
  });

  it('accepts 6-digit hex with hash', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeGreaterThan(1);
  });

  it('accepts 6-digit hex without hash', () => {
    expect(contrastRatio('000000', 'ffffff')).toBe(21);
  });

  it('accepts 3-digit hex with hash', () => {
    expect(contrastRatio('#000', '#fff')).toBe(21);
  });

  it('accepts rgb() string', () => {
    expect(contrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)')).toBe(21);
  });

  it('accepts rgba() — alpha channel ignored', () => {
    expect(contrastRatio('rgba(0, 0, 0, 1)', 'rgba(255, 255, 255, 0)')).toBe(21);
  });

  it('always returns ratio >= 1.0 regardless of input order', () => {
    expect(contrastRatio('#aaaaaa', '#ffffff')).toBeGreaterThanOrEqual(1);
    expect(contrastRatio('#ffffff', '#aaaaaa')).toBeGreaterThanOrEqual(1);
  });

  it('#757575 on white returns ratio >= 4.5 (WCAG AA border)', () => {
    expect(contrastRatio('#757575', '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it('white on #AAAAAA returns ~2.32', () => {
    const ratio = contrastRatio('#ffffff', '#AAAAAA');
    expect(ratio).toBeGreaterThan(2.0);
    expect(ratio).toBeLessThan(2.5);
  });

  it('throws TypeError for non-string input', () => {
    expect(() => contrastRatio(123, '#ffffff')).toThrow(TypeError);
    expect(() => contrastRatio(null, '#ffffff')).toThrow(TypeError);
    expect(() => contrastRatio(undefined, '#ffffff')).toThrow(TypeError);
  });
});
