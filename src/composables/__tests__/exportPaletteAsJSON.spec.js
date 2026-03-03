import { describe, it, expect } from 'vitest';
import { exportPaletteAsJSON } from '../exportPaletteAsJSON';

describe('exportPaletteAsJSON', () => {
  it('returns a valid JSON string', () => {
    const result = exportPaletteAsJSON({ name: 'My Palette', colours: ['#ff0000'] });
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('preserves field order: app, name, colours', () => {
    const result = exportPaletteAsJSON({ name: 'Test', colours: ['#ffffff'] });
    const keys = Object.keys(JSON.parse(result));
    expect(keys).toEqual(['app', 'name', 'colours']);
  });

  it('sets app to "colour-contrast-checker"', () => {
    const result = JSON.parse(exportPaletteAsJSON({ name: 'X', colours: [] }));
    expect(result.app).toBe('colour-contrast-checker');
  });

  it('preserves palette name', () => {
    const result = JSON.parse(exportPaletteAsJSON({ name: 'My Palette', colours: [] }));
    expect(result.name).toBe('My Palette');
  });

  it('preserves colours array', () => {
    const colours = ['#ff0000', '#0000ff'];
    const result = JSON.parse(exportPaletteAsJSON({ name: 'Test', colours }));
    expect(result.colours).toEqual(colours);
  });

  it('handles empty colours array', () => {
    const result = JSON.parse(exportPaletteAsJSON({ name: 'Empty', colours: [] }));
    expect(result.colours).toEqual([]);
  });
});
