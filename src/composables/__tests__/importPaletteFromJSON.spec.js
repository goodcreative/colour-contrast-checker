import { describe, it, expect } from 'vitest';
import { importPaletteFromJSON } from '../importPaletteFromJSON';

const VALID = JSON.stringify({
  app: 'colour-contrast-checker',
  name: 'My Palette',
  colours: ['#ff0000', '#0000ff'],
});

describe('importPaletteFromJSON — happy path', () => {
  it('returns name and colours for valid JSON', () => {
    expect(importPaletteFromJSON(VALID)).toEqual({
      name: 'My Palette',
      colours: ['#ff0000', '#0000ff'],
    });
  });

  it('accepts empty colours array', () => {
    const json = JSON.stringify({ app: 'colour-contrast-checker', name: 'Empty', colours: [] });
    expect(importPaletteFromJSON(json)).toEqual({ name: 'Empty', colours: [] });
  });
});

describe('importPaletteFromJSON — validation errors', () => {
  it('throws on malformed JSON', () => {
    expect(() => importPaletteFromJSON('not json')).toThrow();
  });

  it('throws when app key is wrong', () => {
    const json = JSON.stringify({ app: 'other-app', name: 'Test', colours: [] });
    expect(() => importPaletteFromJSON(json)).toThrow(/app/i);
  });

  it('throws when name field is missing', () => {
    const json = JSON.stringify({ app: 'colour-contrast-checker', colours: [] });
    expect(() => importPaletteFromJSON(json)).toThrow(/name/i);
  });

  it('throws when colours field is missing', () => {
    const json = JSON.stringify({ app: 'colour-contrast-checker', name: 'Test' });
    expect(() => importPaletteFromJSON(json)).toThrow(/colours/i);
  });

  it('throws when colours is not an array', () => {
    const json = JSON.stringify({ app: 'colour-contrast-checker', name: 'Test', colours: 'red' });
    expect(() => importPaletteFromJSON(json)).toThrow(/colours/i);
  });

  it('throws and names the invalid hex value', () => {
    const json = JSON.stringify({ app: 'colour-contrast-checker', name: 'Test', colours: ['notahex'] });
    expect(() => importPaletteFromJSON(json)).toThrow(/notahex/i);
  });
});
