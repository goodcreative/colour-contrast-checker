import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { URL_PORT_KEY, STORAGE_PORT_KEY } from './injectionKeys';

/**
 * Creates an isolated Pinia instance with the given adapters provided via Vue inject.
 * Use in test beforeEach instead of setActivePinia + setAdapters.
 */
export function createTestPinia(urlAdapter, storageAdapter) {
  const app = createApp({});
  const pinia = createPinia();
  app.provide(URL_PORT_KEY, urlAdapter);
  app.provide(STORAGE_PORT_KEY, storageAdapter);
  app.use(pinia);
  setActivePinia(pinia);
  return pinia;
}

/**
 * In-memory UrlPort for tests. Injectable — no window.location access.
 * @param {string} initialSearch  e.g. '?colours=ff0000&complianceMode=AAA'
 */
export function createInMemoryUrlAdapter(initialSearch = '') {
  const params = new URLSearchParams(initialSearch.replace(/^\?/, ''));

  return {
    getParam(key) {
      return params.get(key);
    },
    getSearch() {
      const s = params.toString();
      return s ? '?' + s : '';
    },
    setParams(updates) {
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
  };
}

/**
 * In-memory StoragePort for tests.
 * @param {Object} seed  Initial key/value pairs
 */
export function createInMemoryStorageAdapter(seed = {}) {
  const store = { ...seed };

  return {
    load(key) {
      return key in store ? store[key] : null;
    },
    save(key, value) {
      store[key] = value;
    },
    remove(key) {
      delete store[key];
    },
    snapshot() {
      return { ...store };
    },
  };
}
