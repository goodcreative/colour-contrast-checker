import getURLParam from "@/composables/getURLParam";

const VALID_MODES = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];

export default function getCVDModeFromURL() {
  const mode = getURLParam("cvdMode");
  return VALID_MODES.includes(mode) ? mode : false;
}
