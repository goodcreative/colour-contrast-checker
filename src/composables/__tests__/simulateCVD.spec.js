import { describe, it, expect } from 'vitest';
import simulateCVD from '../simulateCVD.js';

const CVD_TYPES = ['protanopia', 'deuteranopia', 'tritanopia'];

describe('simulateCVD', () => {
  it('returns input unchanged for normal', () => {
    expect(simulateCVD('#ff0000', 'normal')).toBe('#ff0000');
    expect(simulateCVD('#123456', 'normal')).toBe('#123456');
  });

  it('returns input unchanged for unknown type', () => {
    expect(simulateCVD('#ff0000', 'unknown')).toBe('#ff0000');
  });

  it('#ffffff is identity-stable under all CVD types', () => {
    CVD_TYPES.forEach(type => {
      expect(simulateCVD('#ffffff', type)).toBe('#ffffff');
    });
  });

  it('#000000 is identity-stable under all CVD types', () => {
    CVD_TYPES.forEach(type => {
      expect(simulateCVD('#000000', type)).toBe('#000000');
    });
  });

  it('protanopia substantially shifts R channel of pure red', () => {
    const result = simulateCVD('#ff0000', 'protanopia');
    const r = parseInt(result.slice(1, 3), 16);
    expect(r).toBeLessThan(150); // red channel should drop significantly (255 → ~109)
  });

  it('output is always valid 7-char hex', () => {
    const inputs = ['#ff0000', '#00ff00', '#0000ff', '#123abc', '#ffffff', '#000000'];
    CVD_TYPES.forEach(type => {
      inputs.forEach(hex => {
        const result = simulateCVD(hex, type);
        expect(result).toMatch(/^#[0-9a-f]{6}$/);
      });
    });
  });
});
