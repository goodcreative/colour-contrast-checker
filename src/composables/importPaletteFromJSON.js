import checkHexColourIsValid from '@/composables/checkHexColourIsValid';

export function importPaletteFromJSON(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON: could not parse file');
  }

  if (parsed.app !== 'colour-contrast-checker') {
    throw new Error('Invalid file: wrong "app" value — not a colour-contrast-checker palette');
  }

  if (typeof parsed.name !== 'string') {
    throw new Error('Invalid file: missing or invalid "name" field');
  }

  if (!Array.isArray(parsed.colours)) {
    throw new Error('Invalid file: missing or invalid "colours" field');
  }

  const invalid = parsed.colours.filter(c => !checkHexColourIsValid(c));
  if (invalid.length > 0) {
    throw new Error(`Invalid file: invalid hex colours: ${invalid.join(', ')}`);
  }

  return { name: parsed.name, colours: parsed.colours };
}
