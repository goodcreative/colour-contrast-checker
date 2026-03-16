import getURLParam from "@/composables/getURLParam";

/**
 * Reads `?focus=` query param (stored without `#`) and restores the leading `#`.
 * @returns {string|false} Hex colour string, or false if param is absent
 */
export default function getFocusColourFromURL() {
  const value = getURLParam("focus");
  // Param omits `#` to keep URLs clean; restore it here
  return value ? "#" + value : false;
}
