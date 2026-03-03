export function exportPaletteAsASE({ name, colours }) {
  const blocks = colours.map((hex, i) => {
    const colourName = name ? `${name} ${i + 1}` : `Colour ${i + 1}`;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { colourName, r, g, b };
  });

  // Header: 4 (ASEF) + 4 (version) + 4 (block count) = 12 bytes
  // Per block: 2 (type) + 4 (length) + 2 (name_len) + nameLen*2 (UTF-16BE) + 4 (model) + 12 (RGB) + 2 (color type)
  let totalSize = 12;
  blocks.forEach(({ colourName }) => {
    const nameLen = colourName.length + 1; // +1 for null terminator
    totalSize += 2 + 4 + 2 + nameLen * 2 + 4 + 12 + 2;
  });

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  let offset = 0;

  // Magic "ASEF"
  view.setUint8(offset++, 0x41);
  view.setUint8(offset++, 0x53);
  view.setUint8(offset++, 0x45);
  view.setUint8(offset++, 0x46);

  // Version 1.0
  view.setUint16(offset, 0x0001, false); offset += 2;
  view.setUint16(offset, 0x0000, false); offset += 2;

  // Block count
  view.setUint32(offset, blocks.length, false); offset += 4;

  blocks.forEach(({ colourName, r, g, b }) => {
    const nameLen = colourName.length + 1;
    const blockContentLen = 2 + nameLen * 2 + 4 + 12 + 2;

    // Block type: colour entry
    view.setUint16(offset, 0x0001, false); offset += 2;
    // Block length
    view.setUint32(offset, blockContentLen, false); offset += 4;
    // Name length (chars including null terminator)
    view.setUint16(offset, nameLen, false); offset += 2;
    // Name as UTF-16BE
    for (let i = 0; i < colourName.length; i++) {
      view.setUint16(offset, colourName.charCodeAt(i), false);
      offset += 2;
    }
    // Null terminator
    view.setUint16(offset, 0x0000, false); offset += 2;
    // Color model "RGB "
    view.setUint8(offset++, 0x52);
    view.setUint8(offset++, 0x47);
    view.setUint8(offset++, 0x42);
    view.setUint8(offset++, 0x20);
    // R, G, B as IEEE 754 float32 big-endian
    view.setFloat32(offset, r, false); offset += 4;
    view.setFloat32(offset, g, false); offset += 4;
    view.setFloat32(offset, b, false); offset += 4;
    // Color type: Normal
    view.setUint16(offset, 0x0002, false); offset += 2;
  });

  return buffer;
}
