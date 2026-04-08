import { describe, it, expect } from "vitest";
import { encodePaletteToParams, decodePaletteFromSearch } from "../paletteUrlCodec.js";

// ─── encodePaletteToParams ────────────────────────────────────────────────────

describe("encodePaletteToParams", () => {
  const base = {
    colours: ["#ff0000", "#000000"],
    title: "Brand",
    focusColour: "#ff0000",
    contrastMode: "wcag",
    cvdMode: "normal",
    complianceMode: "AA",
  };

  it("strips # from colours and joins with -", () => {
    const { colours } = encodePaletteToParams(base);
    expect(colours).toBe("ff0000-000000");
  });

  it("strips # from focusColour", () => {
    const { focus } = encodePaletteToParams(base);
    expect(focus).toBe("ff0000");
  });

  it("passes title through", () => {
    const { title } = encodePaletteToParams(base);
    expect(title).toBe("Brand");
  });

  it("passes contrastMode through", () => {
    expect(encodePaletteToParams(base).contrastMode).toBe("wcag");
  });

  it("passes cvdMode through", () => {
    expect(encodePaletteToParams(base).cvdMode).toBe("normal");
  });

  it("passes complianceMode through", () => {
    expect(encodePaletteToParams(base).complianceMode).toBe("AA");
  });

  it("empty title becomes null", () => {
    const { title } = encodePaletteToParams({ ...base, title: "" });
    expect(title).toBeNull();
  });

  it("empty focusColour becomes null", () => {
    const { focus } = encodePaletteToParams({ ...base, focusColour: "" });
    expect(focus).toBeNull();
  });

  it("empty colours array becomes null", () => {
    const { colours } = encodePaletteToParams({ ...base, colours: [] });
    expect(colours).toBeNull();
  });

  it("single colour encoded without dash", () => {
    const { colours } = encodePaletteToParams({ ...base, colours: ["#aabbcc"] });
    expect(colours).toBe("aabbcc");
  });
});

// ─── decodePaletteFromSearch ──────────────────────────────────────────────────

describe("decodePaletteFromSearch", () => {
  describe("colours", () => {
    it("returns valid hex array when colours param present", () => {
      const { colours } = decodePaletteFromSearch("?colours=ff0000-00ff00-0000ff");
      expect(colours).toEqual(["#ff0000", "#00ff00", "#0000ff"]);
    });

    it("filters out invalid hex segments", () => {
      const { colours } = decodePaletteFromSearch("?colours=ff0000-GGGGGG-00ff00");
      expect(colours).toEqual(["#ff0000", "#00ff00"]);
    });

    it("accepts 3-digit shorthand hex", () => {
      const { colours } = decodePaletteFromSearch("?colours=f0f");
      expect(colours).toEqual(["#f0f"]);
    });

    it("returns empty array when colours param absent", () => {
      const { colours } = decodePaletteFromSearch("");
      expect(colours).toEqual([]);
    });

    it("returns empty array when colours param is empty string", () => {
      const { colours } = decodePaletteFromSearch("?colours=");
      expect(colours).toEqual([]);
    });

    it("single colour (no dash) is parsed correctly", () => {
      const { colours } = decodePaletteFromSearch("?colours=123456");
      expect(colours).toEqual(["#123456"]);
    });
  });

  describe("title", () => {
    it("returns title string when param present", () => {
      const { title } = decodePaletteFromSearch("?title=My+Palette");
      expect(title).toBe("My Palette");
    });

    it("returns null when title param absent", () => {
      const { title } = decodePaletteFromSearch("");
      expect(title).toBeNull();
    });

    it("returns null when title param is empty string", () => {
      const { title } = decodePaletteFromSearch("?title=");
      expect(title).toBeNull();
    });
  });

  describe("focusColour", () => {
    it("restores # prefix from focus param", () => {
      const { focusColour } = decodePaletteFromSearch("?focus=ff0000");
      expect(focusColour).toBe("#ff0000");
    });

    it("returns null when focus param absent", () => {
      const { focusColour } = decodePaletteFromSearch("");
      expect(focusColour).toBeNull();
    });
  });

  describe("contrastMode", () => {
    it("returns 'wcag' for contrastMode=wcag", () => {
      const { contrastMode } = decodePaletteFromSearch("?contrastMode=wcag");
      expect(contrastMode).toBe("wcag");
    });

    it("returns 'apca' for contrastMode=apca", () => {
      const { contrastMode } = decodePaletteFromSearch("?contrastMode=apca");
      expect(contrastMode).toBe("apca");
    });

    it("returns null for invalid contrastMode", () => {
      const { contrastMode } = decodePaletteFromSearch("?contrastMode=invalid");
      expect(contrastMode).toBeNull();
    });

    it("returns null when contrastMode absent", () => {
      const { contrastMode } = decodePaletteFromSearch("");
      expect(contrastMode).toBeNull();
    });
  });

  describe("cvdMode", () => {
    it.each(["normal", "protanopia", "deuteranopia", "tritanopia"])(
      "returns '%s' for valid cvdMode",
      (mode) => {
        const { cvdMode } = decodePaletteFromSearch(`?cvdMode=${mode}`);
        expect(cvdMode).toBe(mode);
      }
    );

    it("returns null for invalid cvdMode", () => {
      const { cvdMode } = decodePaletteFromSearch("?cvdMode=monochromacy");
      expect(cvdMode).toBeNull();
    });

    it("returns null when cvdMode absent", () => {
      const { cvdMode } = decodePaletteFromSearch("");
      expect(cvdMode).toBeNull();
    });
  });

  describe("complianceMode", () => {
    it("returns 'AA' for complianceMode=AA", () => {
      const { complianceMode } = decodePaletteFromSearch("?complianceMode=AA");
      expect(complianceMode).toBe("AA");
    });

    it("returns 'AAA' for complianceMode=AAA", () => {
      const { complianceMode } = decodePaletteFromSearch("?complianceMode=AAA");
      expect(complianceMode).toBe("AAA");
    });

    it("returns null for invalid complianceMode", () => {
      const { complianceMode } = decodePaletteFromSearch("?complianceMode=A");
      expect(complianceMode).toBeNull();
    });

    it("returns null when complianceMode absent", () => {
      const { complianceMode } = decodePaletteFromSearch("");
      expect(complianceMode).toBeNull();
    });
  });

  describe("full round-trip", () => {
    it("decodes all six fields from a complete search string", () => {
      const search = "?colours=ff0000-000000&title=Brand&focus=ff0000" +
        "&contrastMode=apca&cvdMode=protanopia&complianceMode=AAA";
      const result = decodePaletteFromSearch(search);
      expect(result.colours).toEqual(["#ff0000", "#000000"]);
      expect(result.title).toBe("Brand");
      expect(result.focusColour).toBe("#ff0000");
      expect(result.contrastMode).toBe("apca");
      expect(result.cvdMode).toBe("protanopia");
      expect(result.complianceMode).toBe("AAA");
    });

    it("encode → decode round-trip preserves state", () => {
      const state = {
        colours: ["#ff0000", "#000000"],
        title: "Brand",
        focusColour: "#ff0000",
        contrastMode: "apca",
        cvdMode: "protanopia",
        complianceMode: "AAA",
      };
      const params = encodePaletteToParams(state);
      const search = "?" + new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== null))
      ).toString();
      const decoded = decodePaletteFromSearch(search);
      expect(decoded.colours).toEqual(state.colours);
      expect(decoded.title).toBe(state.title);
      expect(decoded.focusColour).toBe(state.focusColour);
      expect(decoded.contrastMode).toBe(state.contrastMode);
      expect(decoded.cvdMode).toBe(state.cvdMode);
      expect(decoded.complianceMode).toBe(state.complianceMode);
    });
  });
});
