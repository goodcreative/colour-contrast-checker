/**
 * UrlPort — production adapter using window.location / window.history.
 * getParam(key)     → string|null
 * getSearch()       → string  (e.g. '?colours=ff0000')
 * setParams(params) → void    (null value = delete that param)
 */
export function createBrowserUrlAdapter() {
  return {
    getParam(key) {
      return new URLSearchParams(window.location.search).get(key);
    },
    getSearch() {
      return window.location.search;
    },
    setParams(params) {
      const url = new URL(window.location.href);
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) {
          url.searchParams.delete(key);
        } else {
          url.searchParams.set(key, value);
        }
      }
      window.history.replaceState(history.state, '', url);
    },
  };
}
