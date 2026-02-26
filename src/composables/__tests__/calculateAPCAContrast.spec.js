import { describe, it, expect } from 'vitest';
import apcaContrast from '../calculateAPCAContrast.js';

describe('apcaContrast', () => {
  it('black on white returns approx 108', () => {
    const result = apcaContrast('#000000', '#ffffff');
    expect(result).toBeGreaterThan(100);
    expect(result).toBeLessThan(115);
  });

  it('returns a positive value regardless of argument order', () => {
    expect(apcaContrast('#000000', '#ffffff')).toBeGreaterThan(0);
    expect(apcaContrast('#ffffff', '#000000')).toBeGreaterThan(0);
  });

  it('same colour returns 0', () => {
    expect(apcaContrast('#777777', '#777777')).toBe(0);
  });

  it('mid-gray on white returns expected Lc value (~71)', () => {
    const result = apcaContrast('#777777', '#ffffff');
    expect(result).toBeGreaterThanOrEqual(65);
    expect(result).toBeLessThan(80);
  });
});
