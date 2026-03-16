import { describe, it, expect } from "vitest";
import parsePaletteFromURL from "../parsePaletteFromURL.js";

const base = "http://localhost/";

describe("parsePaletteFromURL", () => {
  describe("colours", () => {
    it("returns valid hex array when colours param present", () => {
      const { colours } = parsePaletteFromURL(`${base}?colours=ff0000-00ff00-0000ff`);
      expect(colours).toEqual(["#ff0000", "#00ff00", "#0000ff"]);
    });

    it("filters out invalid hex segments", () => {
      const { colours } = parsePaletteFromURL(`${base}?colours=ff0000-GGGGGG-00ff00`);
      expect(colours).toEqual(["#ff0000", "#00ff00"]);
    });

    it("accepts 3-digit shorthand hex", () => {
      const { colours } = parsePaletteFromURL(`${base}?colours=f0f`);
      expect(colours).toEqual(["#f0f"]);
    });

    it("returns empty array when colours param absent", () => {
      const { colours } = parsePaletteFromURL(base);
      expect(colours).toEqual([]);
    });

    it("returns empty array when colours param is empty string", () => {
      const { colours } = parsePaletteFromURL(`${base}?colours=`);
      expect(colours).toEqual([]);
    });

    it("single colour (no dash) is parsed correctly", () => {
      const { colours } = parsePaletteFromURL(`${base}?colours=123456`);
      expect(colours).toEqual(["#123456"]);
    });
  });

  describe("title", () => {
    it("returns title string when param present", () => {
      const { title } = parsePaletteFromURL(`${base}?title=My+Palette`);
      expect(title).toBe("My Palette");
    });

    it("returns null when title param absent", () => {
      const { title } = parsePaletteFromURL(base);
      expect(title).toBeNull();
    });

    it("returns null when title param is empty string", () => {
      const { title } = parsePaletteFromURL(`${base}?title=`);
      expect(title).toBeNull();
    });
  });

  describe("focusColour", () => {
    it("restores # prefix from focus param", () => {
      const { focusColour } = parsePaletteFromURL(`${base}?focus=ff0000`);
      expect(focusColour).toBe("#ff0000");
    });

    it("returns null when focus param absent", () => {
      const { focusColour } = parsePaletteFromURL(base);
      expect(focusColour).toBeNull();
    });
  });

  describe("contrastMode", () => {
    it("returns 'wcag' for contrastMode=wcag", () => {
      const { contrastMode } = parsePaletteFromURL(`${base}?contrastMode=wcag`);
      expect(contrastMode).toBe("wcag");
    });

    it("returns 'apca' for contrastMode=apca", () => {
      const { contrastMode } = parsePaletteFromURL(`${base}?contrastMode=apca`);
      expect(contrastMode).toBe("apca");
    });

    it("returns null for invalid contrastMode", () => {
      const { contrastMode } = parsePaletteFromURL(`${base}?contrastMode=invalid`);
      expect(contrastMode).toBeNull();
    });

    it("returns null when contrastMode absent", () => {
      const { contrastMode } = parsePaletteFromURL(base);
      expect(contrastMode).toBeNull();
    });
  });

  describe("cvdMode", () => {
    it.each(["normal", "protanopia", "deuteranopia", "tritanopia"])(
      "returns '%s' for valid cvdMode",
      (mode) => {
        const { cvdMode } = parsePaletteFromURL(`${base}?cvdMode=${mode}`);
        expect(cvdMode).toBe(mode);
      }
    );

    it("returns null for invalid cvdMode", () => {
      const { cvdMode } = parsePaletteFromURL(`${base}?cvdMode=monochromacy`);
      expect(cvdMode).toBeNull();
    });

    it("returns null when cvdMode absent", () => {
      const { cvdMode } = parsePaletteFromURL(base);
      expect(cvdMode).toBeNull();
    });
  });

  describe("complianceMode", () => {
    it("returns 'AA' for complianceMode=AA", () => {
      const { complianceMode } = parsePaletteFromURL(`${base}?complianceMode=AA`);
      expect(complianceMode).toBe("AA");
    });

    it("returns 'AAA' for complianceMode=AAA", () => {
      const { complianceMode } = parsePaletteFromURL(`${base}?complianceMode=AAA`);
      expect(complianceMode).toBe("AAA");
    });

    it("returns null for invalid complianceMode", () => {
      const { complianceMode } = parsePaletteFromURL(`${base}?complianceMode=A`);
      expect(complianceMode).toBeNull();
    });

    it("returns null when complianceMode absent", () => {
      const { complianceMode } = parsePaletteFromURL(base);
      expect(complianceMode).toBeNull();
    });
  });

  describe("full URL round-trip", () => {
    it("parses all six fields from a complete URL", () => {
      const url = `${base}?colours=ff0000-000000&title=Brand&focus=ff0000` +
        `&contrastMode=apca&cvdMode=protanopia&complianceMode=AAA`;
      const result = parsePaletteFromURL(url);
      expect(result.colours).toEqual(["#ff0000", "#000000"]);
      expect(result.title).toBe("Brand");
      expect(result.focusColour).toBe("#ff0000");
      expect(result.contrastMode).toBe("apca");
      expect(result.cvdMode).toBe("protanopia");
      expect(result.complianceMode).toBe("AAA");
    });
  });
});
