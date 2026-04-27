import { CONTRAST_MODES, CVD_MODES, COMPLIANCE_MODES } from "@/config/modes";

const isValidHex = hex => /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(hex);

/**
 * @typedef {Object} PaletteUrlState
 * @property {string[]}   colours
 * @property {string}     title
 * @property {string|null} focusColour
 * @property {'wcag'|'apca'} contrastMode
 * @property {'normal'|'protanopia'|'deuteranopia'|'tritanopia'} cvdMode
 * @property {'AA'|'AAA'} complianceMode
 */

/** @returns {PaletteUrlState} */
export function defaultPaletteUrlState() {
  return { colours: [], title: "", focusColour: null, contrastMode: "wcag", cvdMode: "normal", complianceMode: "AA" };
}

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
 * Decodes and validates palette state from a raw URL search string.
 * Always returns a complete PaletteUrlState — missing or invalid fields
 * fall back to defaultPaletteUrlState() values.
 *
 * @param {string} search - e.g. '?colours=ff0000-000000' or ''
 * @returns {PaletteUrlState}
 */
export function decodePaletteFromSearch(search) {
  const defaults = defaultPaletteUrlState();
  const params = new URLSearchParams(search.replace(/^\?/, ""));

  const coloursRaw = params.get("colours");
  const colours = coloursRaw
    ? coloursRaw.split("-").map(seg => "#" + seg).filter(isValidHex)
    : defaults.colours;

  const titleRaw = params.get("title");
  const title = titleRaw || defaults.title;

  const focusRaw = params.get("focus");
  const focusColour = focusRaw ? "#" + focusRaw : defaults.focusColour;

  const contrastRaw = params.get("contrastMode");
  const contrastMode = CONTRAST_MODES.includes(contrastRaw) ? contrastRaw : defaults.contrastMode;

  const cvdRaw = params.get("cvdMode");
  const cvdMode = CVD_MODES.includes(cvdRaw) ? cvdRaw : defaults.cvdMode;

  const complianceRaw = params.get("complianceMode");
  const complianceMode = COMPLIANCE_MODES.includes(complianceRaw) ? complianceRaw : defaults.complianceMode;

  return { colours, title, focusColour, contrastMode, cvdMode, complianceMode };
}
