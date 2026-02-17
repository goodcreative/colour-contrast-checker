import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useColourStore } from '../colourStore';

describe('Colour Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
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
      store.complianceMode = 'AA';
      expect(store.complianceRatios.min).toBe(3);
      expect(store.complianceRatios.max).toBe(4.5);
    });

    it("returns correct ratios for 'AAA' mode", () => {
      const store = useColourStore();
      store.complianceMode = 'AAA';
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
      store.complianceMode = 'AAA';
      const passing = store.passColourCombinations.filter(c => c.includes('#FFFFFF') && c.includes('#000000'));
      expect(passing).toHaveLength(1);
    });

    it('correctly categorizes large text pass combinations for AAA', () => {
      store.complianceMode = 'AAA';
      const largePass = store.largePassColourCombinations.filter(c => c.includes('#FFFFFF') && c.includes('#757575'));
      expect(largePass).toHaveLength(1);
    });
    
    it('correctly categorizes failing combinations for AA', () => {
      store.complianceMode = 'AA';
      const failing = store.failColourCombinations.filter(c => c.includes('#FFFFFF') && c.includes('#AAAAAA'));
      expect(failing).toHaveLength(1);
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
