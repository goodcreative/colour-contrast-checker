import type { PersistencePort } from "@/domain/persistencePort";
import type { Project } from "@/domain/types";

/** In-memory adapter plus a `snapshot()` helper for test assertions, matching
 *  the convention of the other in-memory adapters in `testAdapters.js`. */
export interface InMemoryPersistenceAdapter extends PersistencePort {
  /** Synchronous deep-copied view of all stored Projects, for assertions. */
  snapshot(): Project[];
}

/** Deep-clone a Project so the store and callers never share mutable references. */
function clone(project: Project): Project {
  return structuredClone(project);
}

/**
 * In-memory PersistencePort adapter — the test/dev counterpart to the future
 * Supabase adapter. Holds Projects in a Map and hands out deep copies on every
 * read and write, so mutating a value on either side cannot corrupt the store.
 *
 * @param seed - optional initial Projects
 */
export function createInMemoryPersistenceAdapter(seed: Project[] = []): InMemoryPersistenceAdapter {
  const store = new Map<string, Project>(seed.map((p) => [p.id, clone(p)]));

  return {
    async listProjects() {
      return [...store.values()].map(clone);
    },
    async getProject(id) {
      const found = store.get(id);
      return found ? clone(found) : null;
    },
    async saveProject(project) {
      store.set(project.id, clone(project));
      return clone(project);
    },
    async deleteProject(id) {
      store.delete(id);
    },
    snapshot() {
      return [...store.values()].map(clone);
    },
  };
}
