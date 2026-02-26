import { APCAcontrast, sRGBtoY } from 'apca-w3';
import hexToRGB from '@/composables/hexToRGB.js';

export default function apcaContrast(colour1, colour2) {
  const [r1, g1, b1] = hexToRGB(colour1);
  const [r2, g2, b2] = hexToRGB(colour2);
  const Lc = APCAcontrast(sRGBtoY([r1, g1, b1, 255]), sRGBtoY([r2, g2, b2, 255]));
  return Math.round(Math.abs(Lc) * 10) / 10;
}
