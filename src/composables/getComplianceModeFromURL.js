import getURLParam from "@/composables/getURLParam";

const VALID_MODES = ['AA', 'AAA'];

export default function getComplianceModeFromURL() {
  const mode = getURLParam("complianceMode");
  return VALID_MODES.includes(mode) ? mode : false;
}
