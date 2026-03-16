import hexToRGB from '@/composables/hexToRGB.js';

// Colour-vision deficiency simulation matrices from:
// Machado et al. 2009 "A Physiologically-based Model for Simulation of Color Vision Deficiency"
// Severity=1.0 (full dichromacy). Matrices operate in linear (linearized sRGB) space.
const CVD_MATRICES = {
  protanopia: [
    [ 0.152286,  1.052583, -0.204868],
    [ 0.114503,  0.786281,  0.099216],
    [-0.003882, -0.048116,  1.051998],
  ],
  deuteranopia: [
    [ 0.367322,  0.860646, -0.227968],
    [ 0.280085,  0.672501,  0.047413],
    [-0.011820,  0.042940,  0.968881],
  ],
  tritanopia: [
    [ 1.255528, -0.076749, -0.178779],
    [-0.078411,  0.930809,  0.147602],
    [ 0.004733,  0.691367,  0.303900],
  ],
};

/** Converts an 8-bit sRGB channel (0–255) to linear light (removes gamma). */
function linearize(c) {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

/** Applies sRGB gamma to a linear channel value, clamps to [0,1], returns 0–255 integer. */
function compress(c) {
  const n = c <= 0.0031308
    ? 12.92 * c
    : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(1, n)) * 255);
}

/** Converts a 0–255 integer to a zero-padded two-character hex string. */
function toHex(n) {
  return n.toString(16).padStart(2, '0');
}

/**
 * Simulates how a hex colour appears under a colour-vision deficiency (CVD).
 * Pipeline: sRGB hex → linear RGB → matrix transform → sRGB gamma → hex output.
 *
 * @param {string} hex     - Input colour, e.g. "#aabbcc"
 * @param {string} cvdType - "normal" | "protanopia" | "deuteranopia" | "tritanopia"
 * @returns {string} Simulated hex colour
 */
export default function simulateCVD(hex, cvdType) {
  // "normal" is a passthrough — no simulation needed
  if (cvdType === 'normal') return hex;
  const matrix = CVD_MATRICES[cvdType];
  if (!matrix) return hex;

  // Step 1: hex → 8-bit RGB channels
  const [r, g, b] = hexToRGB(hex);

  // Step 2: linearize each channel (remove sRGB gamma)
  const rL = linearize(r);
  const gL = linearize(g);
  const bL = linearize(b);

  // Step 3: apply CVD matrix in linear space, clamp to [0,1]
  const rS = Math.max(0, Math.min(1, matrix[0][0]*rL + matrix[0][1]*gL + matrix[0][2]*bL));
  const gS = Math.max(0, Math.min(1, matrix[1][0]*rL + matrix[1][1]*gL + matrix[1][2]*bL));
  const bS = Math.max(0, Math.min(1, matrix[2][0]*rL + matrix[2][1]*gL + matrix[2][2]*bL));

  // Step 4: re-apply sRGB gamma and encode as hex
  return `#${toHex(compress(rS))}${toHex(compress(gS))}${toHex(compress(bS))}`;
}
