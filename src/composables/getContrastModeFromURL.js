import getURLParam from "@/composables/getURLParam";

/**
 * Reads `?contrastMode=` and validates it against the two supported modes.
 * @returns {"wcag"|"apca"|false}
 */
export default function getContrastModeFromURL() {
  const mode = getURLParam("contrastMode");
  // Only accept the two known algorithm identifiers
  return mode === "wcag" || mode === "apca" ? mode : false;
}
