/**
 * StoragePort — production adapter using localStorage.
 * load(key)          → string|null
 * save(key, value)   → void
 * remove(key)        → void
 */
export function createBrowserStorageAdapter() {
  return {
    load(key) {
      return localStorage.getItem(key);
    },
    save(key, value) {
      localStorage.setItem(key, value);
    },
    remove(key) {
      localStorage.removeItem(key);
    },
  };
}
