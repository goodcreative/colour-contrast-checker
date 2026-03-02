import hexToRGB from '@/composables/hexToRGB.js';

// Machado et al. 2009, severity=1.0, applied in linear RGB space
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

function linearize(c) {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

function compress(c) {
  const n = c <= 0.0031308
    ? 12.92 * c
    : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(1, n)) * 255);
}

function toHex(n) {
  return n.toString(16).padStart(2, '0');
}

export default function simulateCVD(hex, cvdType) {
  if (cvdType === 'normal') return hex;
  const matrix = CVD_MATRICES[cvdType];
  if (!matrix) return hex;

  const [r, g, b] = hexToRGB(hex);
  const rL = linearize(r);
  const gL = linearize(g);
  const bL = linearize(b);

  const rS = Math.max(0, Math.min(1, matrix[0][0]*rL + matrix[0][1]*gL + matrix[0][2]*bL));
  const gS = Math.max(0, Math.min(1, matrix[1][0]*rL + matrix[1][1]*gL + matrix[1][2]*bL));
  const bS = Math.max(0, Math.min(1, matrix[2][0]*rL + matrix[2][1]*gL + matrix[2][2]*bL));

  return `#${toHex(compress(rS))}${toHex(compress(gS))}${toHex(compress(bS))}`;
}
