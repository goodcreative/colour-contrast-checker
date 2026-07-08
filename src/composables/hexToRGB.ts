/** An [R, G, B, A] tuple with each channel an integer in 0–255. */
export type RGBA = [number, number, number, number];

/**
 * Converts a hex colour string to an [R, G, B, A] integer array (0–255 each).
 * Supports 3-digit, 6-digit, and 8-digit (RRGGBBAA) hex formats, with or without `#`.
 *
 * @param hex - e.g. "#rgb", "#rrggbb", "#rrggbbaa"
 * @returns [r, g, b, a]
 */
export default function hexToRGB(hex: string): RGBA {
  let alpha = false,
    h = hex.slice(hex.startsWith("#") ? 1 : 0); // strip leading `#` if present

  // Expand 3-digit shorthand to 6-digit: "abc" → "aabbcc"
  if (h.length === 3) h = [...h].map((x) => x + x).join("");
  // 8-char hex includes an explicit alpha channel
  else if (h.length === 8) alpha = true;

  // Parse entire hex string as a single integer for bitwise extraction
  const n = parseInt(h, 16);

  // Extract R, G, B, A via bit-shifts and masks
  // With alpha: RRGGBBAA layout — shift right 24/16/8 bits to isolate each byte
  // Without alpha: RRGGBB layout — shift right 16/8/0 bits
  return [
    n >>> (alpha ? 24 : 16), // R
    (n & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8), // G
    (n & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0), // B
    alpha ? n & 0x000000ff : 255, // A (default opaque)
  ];
}
