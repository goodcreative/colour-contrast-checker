import getURLParam from "@/composables/getURLParam";

// All supported colour-vision deficiency simulation types (plus the passthrough)
const VALID_MODES = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];

/**
 * Reads `?cvdMode=` and validates it against the four supported CVD types.
 * @returns {"normal"|"protanopia"|"deuteranopia"|"tritanopia"|false}
 */
export default function getCVDModeFromURL() {
  const mode = getURLParam("cvdMode");
  return VALID_MODES.includes(mode) ? mode : false;
}
