import getURLParam from "@/composables/getURLParam";

/**
 * Reads the `?title=` query param.
 * @returns {string|false} Param value, or false if absent
 */
export default function getTitleFromURL() {
  return getURLParam("title") || false;
}
