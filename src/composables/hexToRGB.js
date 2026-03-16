/**
 * Converts a hex colour string to an [R, G, B, A] integer array (0–255 each).
 * Supports 3-digit, 6-digit, and 8-digit (RRGGBBAA) hex formats, with or without `#`.
 *
 * @param {string} hex - e.g. "#rgb", "#rrggbb", "#rrggbbaa"
 * @returns {[number, number, number, number]} [r, g, b, a]
 */
export default function hexToRGB(hex) {
  let alpha = false,
    h = hex.slice(hex.startsWith("#") ? 1 : 0); // strip leading `#` if present

  // Expand 3-digit shorthand to 6-digit: "abc" → "aabbcc"
  if (h.length === 3) h = [...h].map((x) => x + x).join("");
  // 8-char hex includes an explicit alpha channel
  else if (h.length === 8) alpha = true;

  // Parse entire hex string as a single integer for bitwise extraction
  h = parseInt(h, 16);
  let rgbArray = [];

  // Extract R, G, B, A via bit-shifts and masks
  // With alpha: RRGGBBAA layout — shift right 24/16/8 bits to isolate each byte
  // Without alpha: RRGGBB layout — shift right 16/8/0 bits
  rgbArray.push(h >>> (alpha ? 24 : 16));                                          // R
  rgbArray.push((h & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8));      // G
  rgbArray.push((h & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0));       // B
  rgbArray.push(alpha ? (h & 0x000000ff) : 255);                                   // A (default opaque)

  return rgbArray;
}
