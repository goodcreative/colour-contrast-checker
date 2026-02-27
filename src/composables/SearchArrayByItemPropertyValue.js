/**
 * Searches an array of objects for the first item where item[prop] === value.
 *
 * @param {Array} array - The array to search
 * @param {string} prop - The property name to match against
 * @param {*} value - The value to look for
 * @returns {Object|null} The matching item, or null if not found
 */
export default function searchArrayByProperty(array, prop, value) {
  if (!Array.isArray(array)) return null;
  return array.find((item) => item !== null && item[prop] === value) ?? null;
}
