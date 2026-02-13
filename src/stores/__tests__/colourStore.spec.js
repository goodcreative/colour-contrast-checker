import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useColourStore } from "../colourStore";

describe("colourStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("actions", () => {
    it("adds a colour to the swatches", () => {
      const store = useColourStore();
      store.updateURLData = vi.fn();

      expect(store.colourSwatches).toHaveLength(0);

      store.addColour("#ff0000");

      expect(store.colourSwatches).toHaveLength(1);
      expect(store.colourSwatches[0]).toBe("#ff0000");
    });

    it("does not add a duplicate colour", () => {
      const store = useColourStore();
      store.updateURLData = vi.fn();

      store.addColour("#ff0000");
      store.addColour("#ff0000");

      expect(store.colourSwatches).toHaveLength(1);
    });

    it("removes a colour from the swatches", () => {
      const store = useColourStore();
      store.updateURLData = vi.fn();

      store.addColour("#ff0000");
      store.addColour("#00ff00");

      expect(store.colourSwatches).toHaveLength(2);

      store.removeColour("#ff0000");

      expect(store.colourSwatches).toHaveLength(1);
      expect(store.colourSwatches[0]).toBe("#00ff00");
    });

    it("clears the palette", () => {
      const store = useColourStore();
      store.updateURLData = vi.fn();
      store.listTitle = "Test Title";
      store.setFocusColour("#ff0000");

      store.addColour("#ff0000");
      store.addColour("#00ff00");

      expect(store.colourSwatches).toHaveLength(2);

      store.clearPalette();

      expect(store.colourSwatches).toHaveLength(0);
      expect(store.listTitle).toBe("");
      expect(store.focusColour).toBe("");
    });

    it("sets the focus colour", () => {
      const store = useColourStore();
      store.updateURLData = vi.fn();

      store.setFocusColour("#ff0000");

      expect(store.focusColour).toBe("#ff0000");
      expect(store.updateURLData).toHaveBeenCalled();
    });
  });

  describe("localStorage actions", () => {
    it("adds a palette to localStorage", () => {
      const store = useColourStore();
      store.paletteTitle = "My Palette";
      store.colourSwatches = ["#ff0000", "#00ff00"];

      store.addPaletteToLocalStorage();

      const palettes = JSON.parse(localStorage.getItem("palettes"));
      expect(palettes).toHaveLength(1);
      expect(palettes[0].title).toBe("My Palette");
      expect(palettes[0].colours).toEqual(["#ff0000", "#00ff00"]);
      expect(localStorage.getItem("idCounter")).toBe("1");
    });

    it("loads palettes from localStorage", () => {
      localStorage.setItem(
        "palettes",
        JSON.stringify([
          { id: 0, title: "My Palette", colours: ["#ff0000", "#00ff00"] },
        ])
      );
      localStorage.setItem("idCounter", "1");

      const store = useColourStore();
      store.loadPalettesFromLocalStorage();

      expect(store.palettesGetSet).toHaveLength(1);
      expect(store.palettesGetSet[0].title).toBe("My Palette");
      expect(store.paletteIDCounterGetSet).toBe("1");
    });

    it("deletes a palette from localStorage", () => {
      const store = useColourStore();
      store.palettesGetSet = [
        { id: 0, title: "Palette 1", colours: ["#ff0000"] },
        { id: 1, title: "Palette 2", colours: ["#00ff00"] },
      ];
      store.paletteIDCounterGetSet = 2;

      store.deleteLocalPalette(0);

      expect(store.palettesGetSet).toHaveLength(1);
      expect(store.palettesGetSet[0].title).toBe("Palette 2");
    });

    it("deletes a palette from localStorage (bug fix)", () => {
      const store = useColourStore();
      store.palettesGetSet = [
        { id: 0, title: "Palette 1", colours: ["#ff0000"] },
        { id: 1, title: "Palette 2", colours: ["#00ff00"] },
        { id: 2, title: "Palette 3", colours: ["#0000ff"] },
        { id: 3, title: "Palette 4", colours: ["#ffff00"] },
      ];
      store.paletteIDCounterGetSet = 4;

      store.deleteLocalPalette(2);

      expect(store.palettesGetSet).toHaveLength(3);
      expect(store.palettesGetSet.map((p) => p.title)).toEqual([
        "Palette 1",
        "Palette 2",
        "Palette 4",
      ]);
    });

    it("loads a local palette into the main state", () => {
      const store = useColourStore();
      store.updateURLData = vi.fn();
      store.palettesGetSet = [
        { id: 0, title: "My Palette", colours: ["#ff0000", "#00ff00"] },
      ];

      store.loadLocalPalette(0);

      expect(store.colourSwatches).toEqual(["#ff0000", "#00ff00"]);
      expect(store.paletteTitle).toBe("My Palette");
      expect(store.savedTitle).toBe("My Palette");
      expect(store.focusColour).toBe("");
      expect(store.updateURLData).toHaveBeenCalled();
    });
  });
});
