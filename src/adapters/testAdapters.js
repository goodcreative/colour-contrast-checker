/**
 * In-memory UrlPort for tests. Injectable — no window.location access.
 * @param {string} initialSearch  e.g. '?colours=ff0000&complianceMode=AAA'
 */
export function createInMemoryUrlAdapter(initialSearch = '') {
  const params = new URLSearchParams(initialSearch.replace(/^\?/, ''));
  const log = [];

  return {
    getParam(key) {
      log.push({ method: 'getParam', args: [key] });
      return params.get(key);
    },
    getSearch() {
      const s = params.toString();
      return s ? '?' + s : '';
    },
    setParams(updates) {
      log.push({ method: 'setParams', args: [{ ...updates }] });
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
    },
    snapshot() {
      const s = params.toString();
      return s ? '?' + s : '';
    },
    callsTo(name) {
      return log.filter(e => e.method === name);
    },
  };
}

/**
 * In-memory StoragePort for tests.
 * @param {Object} seed  Initial key/value pairs
 */
export function createInMemoryStorageAdapter(seed = {}) {
  const store = { ...seed };
  const log = [];

  return {
    load(key) {
      log.push({ method: 'load', args: [key] });
      return key in store ? store[key] : null;
    },
    save(key, value) {
      log.push({ method: 'save', args: [key, value] });
      store[key] = value;
    },
    remove(key) {
      log.push({ method: 'remove', args: [key] });
      delete store[key];
    },
    snapshot() {
      return { ...store };
    },
    callsTo(name) {
      return log.filter(e => e.method === name);
    },
  };
}
