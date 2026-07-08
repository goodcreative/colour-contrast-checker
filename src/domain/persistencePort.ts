import type { Project } from "@/domain/types";

/**
 * Repository interface for persisting the domain aggregate (Projects and everything
 * they own). Injected into the store the same way as the existing URL / Storage ports,
 * so the domain can be built and tested against an in-memory adapter before any backend
 * exists. The production adapter will be Supabase-backed.
 *
 * Async throughout, since the production adapter performs network I/O.
 */
export interface PersistencePort {
  /** All Projects owned by the current identity. */
  listProjects(): Promise<Project[]>;
  /** A single Project by id, or null if none exists. */
  getProject(id: string): Promise<Project | null>;
  /** Create or replace a Project; returns the persisted value. */
  saveProject(project: Project): Promise<Project>;
  /** Remove a Project by id. No-op if it does not exist. */
  deleteProject(id: string): Promise<void>;
}
