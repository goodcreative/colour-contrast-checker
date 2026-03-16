import getURLParam from "@/composables/getURLParam";

/**
 * Reads the `?colours=` query param.
 * @returns {string|false} Param value, or false if absent
 */
export default function getColoursFromURL() {
  return getURLParam("colours") || false;
}
