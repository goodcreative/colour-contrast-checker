import { describe, it, expect } from 'vitest';
import { exportPaletteAsASE } from '../exportPaletteAsASE';

// name = "Test 1" → 6 chars + null = 7 UTF-16 units = 14 bytes
// Block content: 2 (name_len) + 14 (name) + 4 (model) + 12 (RGB floats) + 2 (color type) = 34
// Block total:   2 (type) + 4 (length field) + 34 (content) = 40
// File:          12 (header) + 40 = 52 bytes

const MODEL_OFFSET = 12 + 2 + 4 + 2 + 7 * 2; // header + type + len + name_len + name bytes
const RGB_OFFSET = MODEL_OFFSET + 4;

describe('exportPaletteAsASE', () => {
  it('returns an ArrayBuffer', () => {
    expect(exportPaletteAsASE({ name: 'Test', colours: ['#ff0000'] })).toBeInstanceOf(ArrayBuffer);
  });

  it('starts with ASEF magic bytes', () => {
    const view = new DataView(exportPaletteAsASE({ name: 'Test', colours: ['#ff0000'] }));
    expect(view.getUint8(0)).toBe(0x41); // A
    expect(view.getUint8(1)).toBe(0x53); // S
    expect(view.getUint8(2)).toBe(0x45); // E
    expect(view.getUint8(3)).toBe(0x46); // F
  });

  it('has version 0x00010000', () => {
    const view = new DataView(exportPaletteAsASE({ name: 'Test', colours: ['#ff0000'] }));
    expect(view.getUint16(4, false)).toBe(0x0001);
    expect(view.getUint16(6, false)).toBe(0x0000);
  });

  it('encodes block count correctly', () => {
    const view = new DataView(exportPaletteAsASE({ name: 'Test', colours: ['#ff0000', '#0000ff'] }));
    expect(view.getUint32(8, false)).toBe(2);
  });

  it('has block type 0x0001 for colour entry', () => {
    const view = new DataView(exportPaletteAsASE({ name: 'Test', colours: ['#ff0000'] }));
    expect(view.getUint16(12, false)).toBe(0x0001);
  });

  it('has color model "RGB "', () => {
    const view = new DataView(exportPaletteAsASE({ name: 'Test', colours: ['#ff0000'] }));
    expect(view.getUint8(MODEL_OFFSET)).toBe(0x52);     // R
    expect(view.getUint8(MODEL_OFFSET + 1)).toBe(0x47); // G
    expect(view.getUint8(MODEL_OFFSET + 2)).toBe(0x42); // B
    expect(view.getUint8(MODEL_OFFSET + 3)).toBe(0x20); // space
  });

  it('encodes #ff0000 as R=1.0 G=0.0 B=0.0', () => {
    const view = new DataView(exportPaletteAsASE({ name: 'Test', colours: ['#ff0000'] }));
    expect(view.getFloat32(RGB_OFFSET, false)).toBeCloseTo(1.0);
    expect(view.getFloat32(RGB_OFFSET + 4, false)).toBeCloseTo(0.0);
    expect(view.getFloat32(RGB_OFFSET + 8, false)).toBeCloseTo(0.0);
  });

  it('encodes #0000ff as R=0.0 G=0.0 B=1.0', () => {
    const view = new DataView(exportPaletteAsASE({ name: 'Test', colours: ['#0000ff'] }));
    expect(view.getFloat32(RGB_OFFSET, false)).toBeCloseTo(0.0);
    expect(view.getFloat32(RGB_OFFSET + 4, false)).toBeCloseTo(0.0);
    expect(view.getFloat32(RGB_OFFSET + 8, false)).toBeCloseTo(1.0);
  });

  it('has color type 0x0002 (Normal)', () => {
    const view = new DataView(exportPaletteAsASE({ name: 'Test', colours: ['#ff0000'] }));
    expect(view.getUint16(RGB_OFFSET + 12, false)).toBe(0x0002);
  });

  it('returns 12-byte header-only buffer for empty colours', () => {
    const result = exportPaletteAsASE({ name: 'Test', colours: [] });
    expect(result.byteLength).toBe(12);
    expect(new DataView(result).getUint32(8, false)).toBe(0);
  });
});
