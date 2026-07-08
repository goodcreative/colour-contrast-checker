import { describe, it, expect, beforeEach } from "vitest";
import { createInMemoryPersistenceAdapter } from "../inMemoryPersistenceAdapter";
import type { PersistencePort } from "@/domain/persistencePort";
import type { Project } from "@/domain/types";

function makeProject(id: string, name = "Untitled"): Project {
  return {
    id,
    name,
    palettes: [
      {
        id: `${id}-pal`,
        name: "Brand",
        modes: [
          { id: "light", name: "Light" },
          { id: "dark", name: "Dark" },
        ],
        colours: [
          {
            id: `${id}-col`,
            name: "Midnight Navy",
            roles: ["background"],
            values: { light: "#001133", dark: "#000811" },
          },
        ],
      },
    ],
  };
}

describe("createInMemoryPersistenceAdapter", () => {
  let repo: PersistencePort;

  beforeEach(() => {
    repo = createInMemoryPersistenceAdapter();
  });

  it("starts empty", async () => {
    expect(await repo.listProjects()).toEqual([]);
  });

  it("seeds from an initial set of projects", async () => {
    const seeded = createInMemoryPersistenceAdapter([makeProject("a"), makeProject("b")]);
    const ids = (await seeded.listProjects()).map((p) => p.id).sort();
    expect(ids).toEqual(["a", "b"]);
  });

  it("saves and retrieves a project", async () => {
    const project = makeProject("a", "Acme");
    await repo.saveProject(project);
    const loaded = await repo.getProject("a");
    expect(loaded?.name).toBe("Acme");
  });

  it("getProject returns null for an unknown id", async () => {
    expect(await repo.getProject("missing")).toBeNull();
  });

  it("saveProject replaces an existing project with the same id", async () => {
    await repo.saveProject(makeProject("a", "First"));
    await repo.saveProject(makeProject("a", "Second"));
    expect((await repo.listProjects())).toHaveLength(1);
    expect((await repo.getProject("a"))?.name).toBe("Second");
  });

  it("deleteProject removes a project", async () => {
    await repo.saveProject(makeProject("a"));
    await repo.deleteProject("a");
    expect(await repo.getProject("a")).toBeNull();
    expect(await repo.listProjects()).toEqual([]);
  });

  it("deleteProject is a no-op for an unknown id", async () => {
    await repo.saveProject(makeProject("a"));
    await repo.deleteProject("missing");
    expect(await repo.listProjects()).toHaveLength(1);
  });

  it("stores a copy — mutating the input after save does not corrupt the store", async () => {
    const project = makeProject("a", "Original");
    await repo.saveProject(project);
    project.name = "Mutated";
    project.palettes[0].colours[0].values.light = "#ffffff";
    const loaded = await repo.getProject("a");
    expect(loaded?.name).toBe("Original");
    expect(loaded?.palettes[0].colours[0].values.light).toBe("#001133");
  });

  it("returns a copy — mutating a loaded project does not corrupt the store", async () => {
    await repo.saveProject(makeProject("a", "Original"));
    const loaded = await repo.getProject("a");
    loaded!.name = "Mutated";
    const reloaded = await repo.getProject("a");
    expect(reloaded?.name).toBe("Original");
  });

  it("snapshot() exposes a deep-copied view for assertions", async () => {
    const seeded = createInMemoryPersistenceAdapter([makeProject("a"), makeProject("b")]);
    const snap = seeded.snapshot();
    expect(snap.map((p) => p.id).sort()).toEqual(["a", "b"]);
    snap[0].name = "Mutated";
    expect(seeded.snapshot().every((p) => p.name === "Untitled")).toBe(true);
  });
});
