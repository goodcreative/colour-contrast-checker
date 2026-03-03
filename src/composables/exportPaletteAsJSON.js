export function exportPaletteAsJSON({ name, colours }) {
  return JSON.stringify({ app: 'colour-contrast-checker', name, colours }, null, 2);
}
