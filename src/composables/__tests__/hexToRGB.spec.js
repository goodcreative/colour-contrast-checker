import { describe, it, expect } from 'vitest';
import hexToRGB from '../hexToRGB.js';

describe('hexToRGB', () => {
  describe('6-digit hex', () => {
    it('converts #000000 to [0, 0, 0, 255]', () => {
      expect(hexToRGB('#000000')).toEqual([0, 0, 0, 255]);
    });

    it('converts #ffffff to [255, 255, 255, 255]', () => {
      expect(hexToRGB('#ffffff')).toEqual([255, 255, 255, 255]);
    });

    it('converts #ff0000 to [255, 0, 0, 255]', () => {
      expect(hexToRGB('#ff0000')).toEqual([255, 0, 0, 255]);
    });

    it('converts #00ff00 to [0, 255, 0, 255]', () => {
      expect(hexToRGB('#00ff00')).toEqual([0, 255, 0, 255]);
    });

    it('converts #0000ff to [0, 0, 255, 255]', () => {
      expect(hexToRGB('#0000ff')).toEqual([0, 0, 255, 255]);
    });

    it('handles uppercase hex', () => {
      expect(hexToRGB('#ABCDEF')).toEqual([171, 205, 239, 255]);
    });
  });

  describe('6-digit hex without #', () => {
    it('converts ff8800 to [255, 136, 0, 255]', () => {
      expect(hexToRGB('ff8800')).toEqual([255, 136, 0, 255]);
    });
  });

  describe('3-digit hex', () => {
    it('converts #fff to [255, 255, 255, 255]', () => {
      expect(hexToRGB('#fff')).toEqual([255, 255, 255, 255]);
    });

    it('converts #000 to [0, 0, 0, 255]', () => {
      expect(hexToRGB('#000')).toEqual([0, 0, 0, 255]);
    });

    it('converts #f80 to same as #ff8800', () => {
      expect(hexToRGB('#f80')).toEqual([255, 136, 0, 255]);
    });

    it('converts 3-digit without hash', () => {
      expect(hexToRGB('abc')).toEqual([170, 187, 204, 255]);
    });
  });

  describe('8-digit hex (with alpha)', () => {
    it('converts #ff000080 to [255, 0, 0, 128]', () => {
      expect(hexToRGB('#ff000080')).toEqual([255, 0, 0, 128]);
    });

    it('converts #000000ff to [0, 0, 0, 255]', () => {
      expect(hexToRGB('#000000ff')).toEqual([0, 0, 0, 255]);
    });

    it('converts #ffffff00 to [255, 255, 255, 0]', () => {
      expect(hexToRGB('#ffffff00')).toEqual([255, 255, 255, 0]);
    });
  });

  describe('return type', () => {
    it('always returns an array of 4 numbers', () => {
      const result = hexToRGB('#123456');
      expect(result).toHaveLength(4);
      result.forEach(v => expect(typeof v).toBe('number'));
    });
  });
});
