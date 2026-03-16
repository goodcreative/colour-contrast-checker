import checkHexColourIsValid from "@/composables/checkHexColourIsValid";

const VALID_CONTRAST_MODES = ["wcag", "apca"];
const VALID_CVD_MODES = ["normal", "protanopia", "deuteranopia", "tritanopia"];
const VALID_COMPLIANCE_MODES = ["AA", "AAA"];

/**
 * Parses all palette-related state from a URL string.
 * Pure function — injectable urlString means no window mocking in tests.
 *
 * @param {string} [urlString=window.location.href]
 * @returns {{
 *   colours: string[],
 *   title: string|null,
 *   focusColour: string|null,
 *   contrastMode: "wcag"|"apca"|null,
 *   cvdMode: "normal"|"protanopia"|"deuteranopia"|"tritanopia"|null,
 *   complianceMode: "AA"|"AAA"|null
 * }}
 */
export default function parsePaletteFromURL(urlString = window.location.href) {
  const params = new URLSearchParams(new URL(urlString).search);

  const coloursRaw = params.get("colours");
  const colours = coloursRaw
    ? coloursRaw.split("-").map((seg) => "#" + seg).filter(checkHexColourIsValid)
    : [];

  const titleRaw = params.get("title");
  const title = titleRaw || null;

  const focusRaw = params.get("focus");
  const focusColour = focusRaw ? "#" + focusRaw : null;

  const contrastRaw = params.get("contrastMode");
  const contrastMode = VALID_CONTRAST_MODES.includes(contrastRaw) ? contrastRaw : null;

  const cvdRaw = params.get("cvdMode");
  const cvdMode = VALID_CVD_MODES.includes(cvdRaw) ? cvdRaw : null;

  const complianceRaw = params.get("complianceMode");
  const complianceMode = VALID_COMPLIANCE_MODES.includes(complianceRaw) ? complianceRaw : null;

  return { colours, title, focusColour, contrastMode, cvdMode, complianceMode };
}
