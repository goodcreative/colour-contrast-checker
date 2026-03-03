import { describe, it, expect } from 'vitest';
import { exportPaletteAsCSS } from '../exportPaletteAsCSS';

describe('exportPaletteAsCSS', () => {
  it('includes a comment with the palette name', () => {
    const result = exportPaletteAsCSS({ name: 'My Palette', colours: ['#ff0000'] });
    expect(result).toContain('/* My Palette */');
  });

  it('includes :root block', () => {
    const result = exportPaletteAsCSS({ name: 'Test', colours: ['#ff0000'] });
    expect(result).toContain(':root {');
  });

  it('generates sequential --colour-N custom properties', () => {
    const result = exportPaletteAsCSS({ name: 'Test', colours: ['#ff0000', '#0000ff'] });
    expect(result).toContain('--colour-1: #ff0000;');
    expect(result).toContain('--colour-2: #0000ff;');
  });

  it('starts numbering at 1, not 0', () => {
    const result = exportPaletteAsCSS({ name: 'Test', colours: ['#ffffff'] });
    expect(result).toContain('--colour-1: #ffffff;');
    expect(result).not.toContain('--colour-0:');
  });

  it('comment appears before :root', () => {
    const result = exportPaletteAsCSS({ name: 'Test', colours: ['#ff0000'] });
    expect(result.indexOf('/* Test */')).toBeLessThan(result.indexOf(':root {'));
  });

  it('produces empty :root block for empty colours', () => {
    const result = exportPaletteAsCSS({ name: 'Empty', colours: [] });
    expect(result).toContain(':root {');
    expect(result).not.toContain('--colour-');
  });
});
