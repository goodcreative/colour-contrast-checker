/**
 * Tests whether a string is a valid hex colour.
 * Accepts 3-digit (#rgb) and 6-digit (#rrggbb) forms with a leading `#`.
 * @param {string} hexColour
 * @returns {boolean}
 */
export default function checkHexColourIsValid(hexColour) {
  // {1,2} matches either 3 or 6 hex digits (one or two repetitions of [0-9a-fA-F]{3})
  const hexRegex = new RegExp("^#(?:[0-9a-fA-F]{3}){1,2}$");
  return hexRegex.test(hexColour);
}
