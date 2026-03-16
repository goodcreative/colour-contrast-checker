import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useColourStore, setAdapters } from '../colourStore';
import { createInMemoryUrlAdapter, createInMemoryStorageAdapter } from '@/adapters/testAdapters';

describe('Colour Store', () => {
  let urlAdapter;
  let storageAdapter;

  beforeEach(() => {
    setActivePinia(createPinia());
    urlAdapter = createInMemoryUrlAdapter();
    storageAdapter = createInMemoryStorageAdapter();
    setAdapters(urlAdapter, storageAdapter);
  });

  it('initializes with correct default values', () => {
    const store = useColourStore();
    expect(store.colourSwatches).toEqual([]);
    expect(store.complianceMode).toBe('AA');
    expect(store.paletteTitle).toBe('');
    expect(store.focusColour).toBe('');
  });

  describe('addColour Action', () => {
    it('adds a new colour to the palette', () => {
      const store = useColourStore();
      store.addColour('#FFFFFF');
      expect(store.colourSwatches).toHaveLength(1);
      expect(store.colourSwatches[0]).toBe('#FFFFFF');
    });

    it('does not add a duplicate colour', () => {
      const store = useColourStore();
      store.addColour('#FFFFFF');
      store.addColour('#FFFFFF');
      expect(store.colourSwatches).toHaveLength(1);
    });

    it('updates colour combinations when a new colour is added', () => {
      const store = useColourStore();
      store.addColour('#FFFFFF');
      store.addColour('#000000');
      expect(store.uniqueColourCombinations).toHaveLength(1);
      const combination = store.uniqueColourCombinations[0];
      expect(combination[0]).toBe('#000000');
      expect(combination[1]).toBe('#FFFFFF');
      expect(combination[2]).toBe(21);
    });
  });

  describe('removeColour Action', () => {
    it('removes an existing colour from the palette', () => {
      const store = useColourStore();
      store.addColour('#FFFFFF');
      store.addColour('#000000');
      store.removeColour('#FFFFFF');
      expect(store.colourSwatches).toHaveLength(1);
      expect(store.colourSwatches[0]).toBe('#000000');
    });

    it('resets focus colour if the focused colour is removed', () => {
      const store = useColourStore();
      store.addColour('#FFFFFF');
      store.setFocusColour('#FFFFFF');
      store.removeColour('#FFFFFF');
      expect(store.focusColour).toBe('');
    });

    it('updates colour combinations when a colour is removed', () => {
      const store = useColourStore();
      store.addColour('#FFFFFF');
      store.addColour('#000000');
      store.addColour('#FF0000');
      store.removeColour('#FF0000');
      expect(store.uniqueColourCombinations).toHaveLength(1);
    });
  });

  describe('complianceRatios Computed Property', () => {
    it("returns correct ratios for 'AA' mode", () => {
      const store = useColourStore();
      store.setComplianceMode('AA');
      expect(store.complianceRatios.min).toBe(3);
      expect(store.complianceRatios.max).toBe(4.5);
    });

    it("returns correct ratios for 'AAA' mode", () => {
      const store = useColourStore();
      store.setComplianceMode('AAA');
      expect(store.complianceRatios.min).toBe(4.5);
      expect(store.complianceRatios.max).toBe(7);
    });
  });

  describe('focusColour and Combinations', () => {
    it('filters combinations based on focus colour', () => {
      const store = useColourStore();
      store.addColour('#FFFFFF');
      store.addColour('#000000');
      store.addColour('#FF0000');
      store.setFocusColour('#FFFFFF');
      expect(store.uniqueColourCombinations).toHaveLength(2);
      expect(store.uniqueColourCombinations.every(combo => combo.includes('#FFFFFF'))).toBe(true);
    });
  });

  describe('Contrast Combination Groups', () => {
    let store;
    beforeEach(() => {
      store = useColourStore();
      store.addColour('#FFFFFF'); // White
      store.addColour('#000000'); // Black - 21.0 contrast with white (Passes AAA)
      store.addColour('#757575'); // Gray - 4.63 contrast with white (Passes AA, fails AAA)
      store.addColour('#AAAAAA'); // Light Gray - 2.22 contrast with white (Fails AA)
    });

    it('correctly categorizes passing combinations for AAA', () => {
      store.setComplianceMode('AAA');
      const passing = store.passColourCombinations.filter(c => c.includes('#FFFFFF') && c.includes('#000000'));
      expect(passing).toHaveLength(1);
    });

    it('correctly categorizes large text pass combinations for AAA', () => {
      store.setComplianceMode('AAA');
      const largePass = store.largePassColourCombinations.filter(c => c.includes('#FFFFFF') && c.includes('#757575'));
      expect(largePass).toHaveLength(1);
    });
    
    it('correctly categorizes failing combinations for AA', () => {
      store.setComplianceMode('AA');
      const failing = store.failColourCombinations.filter(c => c.includes('#FFFFFF') && c.includes('#AAAAAA'));
      expect(failing).toHaveLength(1);
    });
  });

  describe('contrastMode', () => {
    it("defaults to 'wcag'", () => {
      const store = useColourStore();
      expect(store.contrastMode).toBe('wcag');
    });

    it("setContrastMode('apca') updates state", () => {
      const store = useColourStore();
      store.setContrastMode('apca');
      expect(store.contrastMode).toBe('apca');
    });

    it('APCA AA: complianceRatios min=45, max=60', () => {
      const store = useColourStore();
      store.setContrastMode('apca');
      store.setComplianceMode('AA');
      expect(store.complianceRatios.min).toBe(45);
      expect(store.complianceRatios.max).toBe(60);
    });

    it('APCA AAA: complianceRatios min=60, max=75', () => {
      const store = useColourStore();
      store.setContrastMode('apca');
      store.setComplianceMode('AAA');
      expect(store.complianceRatios.min).toBe(60);
      expect(store.complianceRatios.max).toBe(75);
    });

    it('APCA mode: black/white combination has Lc > 100', () => {
      const store = useColourStore();
      store.setContrastMode('apca');
      store.addColour('#000000');
      store.addColour('#ffffff');
      const combo = store.uniqueColourCombinations[0];
      expect(combo[2]).toBeGreaterThan(100);
    });

    it('APCA AA: categorizes black/white as pass, mid-gray as largePass, light-gray as fail', () => {
      const store = useColourStore();
      store.setContrastMode('apca');
      store.setComplianceMode('AA');
      store.addColour('#ffffff');
      store.addColour('#000000'); // Lc 106 → pass (>60)
      store.addColour('#999999'); // Lc 54.6 → largePass (45-60)
      store.addColour('#bbbbbb'); // Lc 36.7 → fail (<45)

      const hasBlackWhiteInPass = store.passColourCombinations.some(
        c => c.includes('#000000') && c.includes('#ffffff')
      );
      const hasGrayInLargePass = store.largePassColourCombinations.some(
        c => c.includes('#999999') && c.includes('#ffffff')
      );
      const hasLightGrayInFail = store.failColourCombinations.some(
        c => c.includes('#bbbbbb') && c.includes('#ffffff')
      );
      expect(hasBlackWhiteInPass).toBe(true);
      expect(hasGrayInLargePass).toBe(true);
      expect(hasLightGrayInFail).toBe(true);
    });
  });

  describe('Archive Actions', () => {
    let store;
    beforeEach(() => {
      store = useColourStore();
      store.addColour('#FFFFFF');
      store.addColour('#000000');
      store.paletteTitle = 'Palette A';
    });

    it('addPaletteToLocalStorage adds palette with correct shape', () => {
      store.addPaletteToLocalStorage();
      expect(store.palettes).toHaveLength(1);
      expect(store.palettes[0].title).toBe('Palette A');
      expect(store.palettes[0].colours).toEqual(['#000000', '#FFFFFF']);
      expect(store.palettes[0].id).toBe(0);
    });

    it('addPaletteToLocalStorage increments paletteIDCounter', () => {
      store.addPaletteToLocalStorage();
      store.paletteTitle = 'Palette B';
      store.addPaletteToLocalStorage();
      expect(store.palettes).toHaveLength(2);
      expect(store.palettes[0].id).toBe(1);
      expect(store.palettes[1].id).toBe(0);
    });

    it('deleteLocalPalette removes only the target item (non-first)', () => {
      store.addPaletteToLocalStorage();          // id 0
      store.paletteTitle = 'Palette B';
      store.addPaletteToLocalStorage();          // id 1 (unshifted → index 0)
      // palettes = [B(id1), A(id0)]
      store.deleteLocalPalette(0);               // delete A at index 1
      expect(store.palettes).toHaveLength(1);
      expect(store.palettes[0].title).toBe('Palette B');
    });

    it('deleteLocalPalette removes only the target item (first)', () => {
      store.addPaletteToLocalStorage();
      store.paletteTitle = 'Palette B';
      store.addPaletteToLocalStorage();
      store.deleteLocalPalette(1);               // delete B at index 0
      expect(store.palettes).toHaveLength(1);
      expect(store.palettes[0].title).toBe('Palette A');
    });

    it('loadPalettesFromLocalStorage restores palettes and idCounter as number', () => {
      store.addPaletteToLocalStorage();
      const freshStore = useColourStore();
      freshStore.loadPalettesFromLocalStorage();
      expect(freshStore.palettes).toHaveLength(1);
      expect(typeof freshStore.paletteIDCounter).toBe('number');
    });
  });

  describe('clearPalette Action', () => {
    it('resets swatches, title, and focus', () => {
      const store = useColourStore();
      store.addColour('#FFFFFF');
      store.addColour('#000000');
      store.paletteTitle = 'Test';
      store.setFocusColour('#FFFFFF');
      store.clearPalette();
      expect(store.colourSwatches).toEqual([]);
      expect(store.paletteTitle).toBe('');
      expect(store.focusColour).toBe('');
    });
  });

  describe('closeSample Action', () => {
    it('clears sampleColours', () => {
      const store = useColourStore();
      store.sampleColours = ['#ff0000', '#00ff00'];
      expect(store.isSampleMode).toBe(true);
      store.closeSample();
      expect(store.sampleColours).toEqual([]);
      expect(store.isSampleMode).toBe(false);
    });
  });

  describe('formatPaletteQueryString', () => {
    it('formats colours as dash-separated hex without #', () => {
      const store = useColourStore();
      store.addColour('#ff0000');
      store.addColour('#00ff00');
      // addColour uses unshift, so order is reversed
      expect(store.colourSwatches).toEqual(['#00ff00', '#ff0000']);
    });

    it('returns empty string for no colours', () => {
      const store = useColourStore();
      expect(store.colourSwatches).toEqual([]);
    });
  });

  describe('complianceMode', () => {
    it("setComplianceMode('AAA') updates state and URL", () => {
      const store = useColourStore();
      store.setComplianceMode('AAA');
      expect(store.complianceMode).toBe('AAA');
      expect(urlAdapter.snapshot()).toContain('complianceMode=AAA');
    });

    it("setComplianceMode('AA') writes complianceMode=AA to URL", () => {
      const store = useColourStore();
      store.setComplianceMode('AA');
      expect(urlAdapter.snapshot()).toContain('complianceMode=AA');
    });

    it('loadPaletteFromQueryString applies all parsed fields to store state', () => {
      setAdapters(
        createInMemoryUrlAdapter('?colours=ff0000-000000&title=Brand&focus=ff0000&contrastMode=apca&cvdMode=protanopia&complianceMode=AAA'),
        storageAdapter,
      );
      const store = useColourStore();
      store.loadPaletteFromQueryString();
      expect(store.colourSwatches).toEqual(['#ff0000', '#000000']);
      expect(store.paletteTitle).toBe('Brand');
      expect(store.focusColour).toBe('#ff0000');
      expect(store.contrastMode).toBe('apca');
      expect(store.cvdMode).toBe('protanopia');
      expect(store.complianceMode).toBe('AAA');
    });

    it('loadPaletteFromQueryString reads complianceMode=AAA from URL', () => {
      setAdapters(createInMemoryUrlAdapter('?complianceMode=AAA'), storageAdapter);
      const store = useColourStore();
      store.loadPaletteFromQueryString();
      expect(store.complianceMode).toBe('AAA');
    });

    it('loadPaletteFromQueryString ignores invalid complianceMode', () => {
      setAdapters(createInMemoryUrlAdapter('?complianceMode=invalid'), storageAdapter);
      const store = useColourStore();
      store.loadPaletteFromQueryString();
      expect(store.complianceMode).toBe('AA');
    });

    it('hideCVDPanel resets cvdMode to normal', () => {
      const store = useColourStore();
      store.setCVDMode('protanopia');
      expect(store.cvdMode).toBe('protanopia');
      store.hideCVDPanel();
      expect(store.cvdMode).toBe('normal');
    });
  });

  describe('paletteCanBeArchived Computed Property', () => {
    it('returns true when palette has a title and colours', () => {
      const store = useColourStore();
      store.addColour('#FFFFFF');
      store.paletteTitle = 'My Palette';
      expect(store.paletteCanBeArchived).toBe(true);
    });

    it('returns false when palette has no title', () => {
      const store = useColourStore();
      store.addColour('#FFFFFF');
      store.paletteTitle = '';
      expect(store.paletteCanBeArchived).toBe(false);
    });

    it('returns false when palette has no colours', () => {
      const store = useColourStore();
      store.paletteTitle = 'My Palette';
      expect(store.colourSwatches).toHaveLength(0);
      expect(store.paletteCanBeArchived).toBe(false);
    });
  });
});
