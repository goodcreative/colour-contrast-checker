import { describe, it, expect } from "vitest";
import { ROLE_VOCABULARY, ROLE_IDS, getRole } from "../roles";
import type { RoleClassification } from "../types";

const VALID_CLASSIFICATIONS: RoleClassification[] = ["foreground", "background", "both"];

describe("ROLE_VOCABULARY", () => {
  it("is a non-empty controlled vocabulary", () => {
    expect(ROLE_VOCABULARY.length).toBeGreaterThan(0);
  });

  it("every role has an id, a label, and a valid classification", () => {
    for (const role of ROLE_VOCABULARY) {
      expect(role.id).toBeTruthy();
      expect(role.label).toBeTruthy();
      expect(VALID_CLASSIFICATIONS).toContain(role.classification);
    }
  });

  it("role ids are unique", () => {
    const ids = ROLE_VOCABULARY.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes the core roles from ADR 0006", () => {
    for (const id of ["background", "surface", "text", "icon", "border", "accent", "brand"]) {
      expect(ROLE_IDS).toContain(id);
    }
  });

  it("classifies surfaces as background and content as foreground (ADR 0006)", () => {
    expect(getRole("background")?.classification).toBe("background");
    expect(getRole("surface")?.classification).toBe("background");
    expect(getRole("text")?.classification).toBe("foreground");
    expect(getRole("icon")?.classification).toBe("foreground");
    expect(getRole("border")?.classification).toBe("foreground");
    expect(getRole("accent")?.classification).toBe("foreground");
    expect(getRole("brand")?.classification).toBe("foreground");
  });
});

describe("getRole", () => {
  it("returns the matching role", () => {
    const role = getRole("text");
    expect(role).toBeDefined();
    expect(role?.id).toBe("text");
  });

  it("returns null for an unknown id", () => {
    expect(getRole("nonsense")).toBeNull();
  });
});
