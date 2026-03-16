/**
 * Returns the value of a named query param from the current page URL, or null if absent.
 * @param {string} key - Query parameter name
 * @returns {string|null}
 */
export default function getURLParam(key) {
  const params = new URLSearchParams(new URL(window.location.href).search);
  return params.get(key);
}
