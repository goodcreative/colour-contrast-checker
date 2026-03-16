import { APCAcontrast, sRGBtoY } from 'apca-w3';
import hexToRGB from '@/composables/hexToRGB.js';

/**
 * Calculates APCA (Advanced Perceptual Contrast Algorithm) contrast between two hex colours.
 * APCA models human spatial-frequency perception more accurately than WCAG 2.x contrast ratios.
 * Returns the absolute Lightness Contrast (Lc) value, rounded to 1 decimal place.
 *
 * @param {string} colour1 - Foreground hex colour (e.g. "#112233")
 * @param {string} colour2 - Background hex colour
 * @returns {number} Absolute Lc value (0–106 range typical)
 */
export default function apcaContrast(colour1, colour2) {
  // Step 1: Convert hex strings to [R, G, B] integer arrays (0–255)
  const [r1, g1, b1] = hexToRGB(colour1);
  const [r2, g2, b2] = hexToRGB(colour2);

  // Step 2: Convert sRGB channels to perceptual luminance Y; alpha set to 255 (fully opaque)
  // Step 3: APCAcontrast returns a signed Lc value (positive = dark-on-light, negative = light-on-dark)
  const Lc = APCAcontrast(sRGBtoY([r1, g1, b1, 255]), sRGBtoY([r2, g2, b2, 255]));

  // Step 4: Take absolute value (direction is irrelevant here) and round to 1 decimal place
  return Math.round(Math.abs(Lc) * 10) / 10;
}
