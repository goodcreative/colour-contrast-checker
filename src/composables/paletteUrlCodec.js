import checkHexColourIsValid from "@/composables/checkHexColourIsValid";

const VALID_CONTRAST_MODES   = ["wcag", "apca"];
const VALID_CVD_MODES        = ["normal", "protanopia", "deuteranopia", "tritanopia"];
const VALID_COMPLIANCE_MODES = ["AA", "AAA"];

/**
 * Encodes active palette state into a raw params object ready for
 * _urlPort.setParams(). Null values instruct the adapter to delete that param.
 *
 * @param {Object} state
 * @param {string[]} state.colours       - hex strings with leading #
 * @param {string}   state.title         - empty string → null
 * @param {string}   state.focusColour   - empty string → null
 * @param {string}   state.contrastMode
 * @param {string}   state.cvdMode
 * @param {string}   state.complianceMode
 *
 * @returns {Record<string, string|null>}
 */
export function encodePaletteToParams({ colours, title, focusColour, contrastMode, cvdMode, complianceMode }) {
  return {
    colours:        colours.length ? colours.map(c => c.replace("#", "")).join("-") : null,
    title:          title || null,
    focus:          focusColour ? focusColour.replace("#", "") : null,
    contrastMode,
    cvdMode,
    complianceMode,
  };
}

/**
 * Decodes and validates palette state from a raw URL search string
 * (as returned by urlPort.getSearch()). Accepts '' for an empty URL.
 *
 * @param {string} search - e.g. '?colours=ff0000-000000' or ''
 *
 * @returns {{
 *   colours:        string[],
 *   title:          string|null,
 *   focusColour:    string|null,
 *   contrastMode:   'wcag'|'apca'|null,
 *   cvdMode:        'normal'|'protanopia'|'deuteranopia'|'tritanopia'|null,
 *   complianceMode: 'AA'|'AAA'|null,
 * }}
 */
export function decodePaletteFromSearch(search) {
  const params = new URLSearchParams(search.replace(/^\?/, ""));

  const coloursRaw = params.get("colours");
  const colours = coloursRaw
    ? coloursRaw.split("-").map(seg => "#" + seg).filter(checkHexColourIsValid)
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
