import { describe, it, expect } from 'vitest';
import checkHexColourIsValid from '../checkHexColourIsValid.js';

describe('checkHexColourIsValid', () => {
  describe('valid hex colours → true', () => {
    it('accepts 6-digit hex with hash', () => {
      expect(checkHexColourIsValid('#abcdef')).toBe(true);
    });

    it('accepts 3-digit hex with hash', () => {
      expect(checkHexColourIsValid('#abc')).toBe(true);
    });

    it('accepts uppercase hex', () => {
      expect(checkHexColourIsValid('#ABCDEF')).toBe(true);
    });

    it('accepts mixed case', () => {
      expect(checkHexColourIsValid('#aBcDeF')).toBe(true);
    });
  });

  describe('invalid hex colours → false', () => {
    it('rejects hex without hash', () => {
      expect(checkHexColourIsValid('abcdef')).toBe(false);
    });

    it('rejects 4-digit hex', () => {
      expect(checkHexColourIsValid('#abcd')).toBe(false);
    });

    it('rejects 5-digit hex', () => {
      expect(checkHexColourIsValid('#abcde')).toBe(false);
    });

    it('rejects 7-digit hex', () => {
      expect(checkHexColourIsValid('#abcdefg')).toBe(false);
    });

    it('rejects 8-digit hex with alpha', () => {
      expect(checkHexColourIsValid('#abcdef00')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(checkHexColourIsValid('')).toBe(false);
    });

    it('rejects hash alone', () => {
      expect(checkHexColourIsValid('#')).toBe(false);
    });

    it('rejects non-hex chars', () => {
      expect(checkHexColourIsValid('#xyz123')).toBe(false);
    });

    it('rejects rgb() string', () => {
      expect(checkHexColourIsValid('rgb(0, 0, 0)')).toBe(false);
    });
  });
});
