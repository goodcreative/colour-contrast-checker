export function exportPaletteAsCSS({ name, colours }) {
  const vars = colours.map((c, i) => `  --colour-${i + 1}: ${c};`).join('\n');
  return `/* ${name} */\n:root {\n${vars}\n}`;
}
