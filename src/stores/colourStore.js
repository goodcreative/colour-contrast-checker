import { ref, computed, readonly } from "vue";
import { defineStore } from "pinia";
import checkHexColourIsValid from "@/composables/checkHexColourIsValid";
import getColoursFromURL from "@/composables/getColoursFromURL";
import getTitleFromURL from "@/composables/getTitleFromURL";
import getFocusColourFromURL from "@/composables/getFocusColourFromURL";
import getContrastModeFromURL from "@/composables/getContrastModeFromURL";
import getCVDModeFromURL from "@/composables/getCVDModeFromURL";
import getComplianceModeFromURL from "@/composables/getComplianceModeFromURL";
import contrastRatio from "@/composables/calculateColourContrast";
import searchArrayByProperty from "@/composables/SearchArrayByItemPropertyValue";
import apcaContrast from "@/composables/calculateAPCAContrast.js";
import simulateCVD from "@/composables/simulateCVD.js";
import { contrastConfig } from "@/config/contrastConfig.js";

/**
 * Pinia store for managing colour palettes, compliance modes, and contrast calculations.
 */
export const useColourStore = defineStore("colourStore", () => {
  // --- STATE ---

  /**
   * The currently selected WCAG compliance mode ('AA' or 'AAA').
   * @type {import('vue').Ref<string>}
   */
  const complianceMode = ref("AA");

  /**
   * The selected contrast algorithm: 'wcag' or 'apca'.
   * @type {import('vue').Ref<string>}
   */
  const contrastMode = ref("wcag");

  /**
   * The active CVD simulation type: 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia'.
   * @type {import('vue').Ref<string>}
   */
  const cvdMode = ref("normal");

  /**
   * Array of saved colour palettes.
   * @type {import('vue').Ref<Palette[]>}
   */
  const palettes = ref([]);

  /**
   * Counter for generating unique palette IDs.
   * @type {import('vue').Ref<number>}
   */
  const paletteIDCounter = ref(0);

  /**
   * Colours used in "sample mode" for temporary testing or demonstration.
   * @type {import('vue').Ref<string[]>}
   */
  const sampleColours = ref([]);

  /**
   * The main array of colour swatches currently being displayed/analyzed.
   * @type {import('vue').Ref<string[]>}
   */
  const colourSwatches = ref([]);

  /**
   * The currently focused colour, used for filtering combinations.
   * @type {import('vue').Ref<string>}
   */
  const focusColour = ref("");

  /**
   * The current title for the active colour palette.
   * @type {import('vue').Ref<string>}
   */
  const paletteTitle = ref("");

  /**
   * Stores the last saved title of the palette, used for comparison.
   * @type {import('vue').Ref<string>}
   */
  const savedTitle = ref("");

  // --- GETTERS (Computed Properties) ---

  /**
   * Computed property that returns the min/max contrast ratios based on the current compliance mode.
   * @type {import('vue').ComputedRef<ComplianceRatios|false>}
   */
  const complianceRatios = computed(() => {
    const mode = contrastMode.value;
    const level = complianceMode.value.toLowerCase();
    return contrastConfig[mode]?.[level] ?? false;
  });

  /**
   * Indicates if the app is currently in sample mode (i.e., `sampleColours` has items).
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isSampleMode = computed(() => sampleColours.value.length > 0);

  /**
   * Maps each original swatch hex to its CVD-simulated hex.
   * @type {import('vue').ComputedRef<Map<string, string>>}
   */
  const simulatedSwatchMap = computed(() =>
    new Map(colourSwatches.value.map(h => [h, simulateCVD(h, cvdMode.value)]))
  );

  /**
   * Computes all unique colour combinations from `colourSwatches` and their base contrast ratios.
   * If `focusColour` is set, only combinations involving the focus colour are returned.
   * Each combination is an array: `[colour1, colour2, baseRatio]` where baseRatio is CVD-independent.
   * @type {import('vue').ComputedRef<Array<[string, string, number]>>}
   */
  const uniqueColourCombinations = computed(() => {
    const combinations = [];
    const seenPairs = new Map();
    const colours = [...colourSwatches.value];

    let primaryColourSet = focusColour.value ? [focusColour.value] : colours;

    primaryColourSet.forEach((firstColour) => {
      colours.forEach((secondColour) => {
        if (firstColour === secondColour) return;

        const sortedPair = [firstColour, secondColour].sort();
        const key = sortedPair.join('-');

        if (!seenPairs.has(key)) {
          const pairToPush = focusColour.value ? [firstColour, secondColour] : sortedPair;
          const calcFn = contrastMode.value === 'apca' ? apcaContrast : contrastRatio;
          const ratio = contrastMode.value === 'apca'
            ? calcFn(firstColour, secondColour)
            : Math.round(calcFn(firstColour, secondColour) * 100) / 100;

          combinations.push([...pairToPush, ratio]);
          seenPairs.set(key, true);
        }
      });
    });

    return combinations;
  });

  /**
   * Categorizes all unique colour combinations into 'pass', 'largePass', and 'fail'
   * based on the current compliance mode. This avoids re-iterating over the combinations.
   * @type {import('vue').ComputedRef<{pass: Array, largePass: Array, fail: Array}>}
   */
  const categorizedCombinations = computed(() => {
    const categories = {
      pass: [],
      largePass: [],
      fail: [],
    };

    uniqueColourCombinations.value.forEach((item) => {
      const ratio = item[2];
      if (ratio >= complianceRatios.value.max) {
        categories.pass.push(item);
      } else if (ratio >= complianceRatios.value.min) {
        categories.largePass.push(item);
      } else {
        categories.fail.push(item);
      }
    });

    // Sort each category
    categories.pass.sort(compare);
    categories.largePass.sort(compare);
    categories.fail.sort(compare);

    return categories;
  });

  /**
   * Computed property returning colour combinations that fully pass the current compliance mode.
   * @type {import('vue').ComputedRef<Array<[string, string, number]>>}
   */
  const passColourCombinations = computed(() => categorizedCombinations.value.pass);

  /**
   * Computed property returning colour combinations that partially pass (large text).
   * @type {import('vue').ComputedRef<Array<[string, string, number]>>}
   */
  const largePassColourCombinations = computed(() => categorizedCombinations.value.largePass);

  /**
   * Computed property returning colour combinations that fail the current compliance mode.
   * @type {import('vue').ComputedRef<Array<[string, string, number]>>}
   */
  const failColourCombinations = computed(() => categorizedCombinations.value.fail);

  /**
   * Indicates if the current palette title has been updated compared to the last saved title.
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isTitleUnchanged = computed(() => savedTitle.value === paletteTitle.value);

  /**
   * Indicates if the current palette can be archived (has a title and colours).
   * @type {import('vue').ComputedRef<boolean>}
   */
  const paletteCanBeArchived = computed(() => paletteTitle.value !== "" && colourSwatches.value.length > 0);

  // --- ACTIONS ---

  /**
   * Sets the contrast algorithm mode and updates the URL.
   * @param {string} mode - The contrast mode to set ('wcag' or 'apca').
   */
  function setContrastMode(mode) {
    contrastMode.value = mode;
    updateURLData();
  }

  function setComplianceMode(mode) {
    complianceMode.value = mode;
    updateURLData();
  }

  function setCVDMode(mode) {
    cvdMode.value = mode;
    updateURLData();
  }

  function hideCVDPanel() {
    setCVDMode('normal');
  }

  function setFocusColour(colour) {
    focusColour.value = colour;
    updateURLData();
  }

  /**
   * Loads colour palette data from the URL query string.
   */
  function loadPaletteFromQueryString() {
    colourSwatches.value = [];
    const coloursInURL = getColoursFromURL();

    if (coloursInURL) {
      const coloursToAdd = coloursInURL.split("-");
      coloursToAdd.forEach((element) => {
        const formattedHex = "#" + element;
        if (checkHexColourIsValid(formattedHex)) {
          colourSwatches.value.push(formattedHex);
        }
      });
    }

    paletteTitle.value = "";
    const titleInURL = getTitleFromURL();

    if (titleInURL) {
      savedTitle.value = titleInURL;
      paletteTitle.value = titleInURL;
    }

    const focusColourInURL = getFocusColourFromURL();
    if (focusColourInURL) {
      setFocusColour(focusColourInURL);
    }

    const modeFromURL = getContrastModeFromURL();
    if (modeFromURL) contrastMode.value = modeFromURL;

    const cvdFromURL = getCVDModeFromURL();
    if (cvdFromURL) cvdMode.value = cvdFromURL;

    const complianceModeFromURL = getComplianceModeFromURL();
    if (complianceModeFromURL) complianceMode.value = complianceModeFromURL;
  }

  /**
   * Loads a saved palette from the local store into the active palette.
   * @param {number} id - The ID of the palette to load.
   */
  function loadLocalPalette(id) {
    const localPalette = searchArrayByProperty(palettes.value, "id", id);
    if (!localPalette) return;
    colourSwatches.value = [...localPalette.colours];
    paletteTitle.value = localPalette.title;
    savedTitle.value = localPalette.title;
    setFocusColour("");
    updateURLData();
  }

  /**
   * Deletes a saved palette from the local store.
   * @param {number} id - The ID of the palette to delete.
   */
  function deleteLocalPalette(id) {
    const palette = searchArrayByProperty(palettes.value, "id", id);
    if (!palette) return;
    const idx = palettes.value.indexOf(palette);
    palettes.value.splice(idx, 1);
    updateLocalStorage();
  }

  /**
   * Loads all saved palettes and the ID counter from browser local storage.
   */
  function loadPalettesFromLocalStorage() {
    if (localStorage.getItem("palettes") && localStorage.getItem("idCounter")) {
      palettes.value = JSON.parse(localStorage.getItem("palettes"));
      paletteIDCounter.value = parseInt(localStorage.getItem("idCounter"), 10);
    }
  }

  /**
   * Adds the current active palette to the local storage, if it has a title.
   */
  function addPaletteToLocalStorage() {
    if (paletteTitle.value !== "") {
      let savedPalette = {
        colours: [...colourSwatches.value],
        id: paletteIDCounter.value,
        title: paletteTitle.value,
      };

      palettes.value.unshift(savedPalette);
      paletteIDCounter.value++;
      updateLocalStorage();
    }
  }

  /**
   * Updates the 'palettes' and 'idCounter' items in browser local storage.
   */
  function updateLocalStorage() {
    localStorage.setItem("palettes", JSON.stringify(palettes.value));
    localStorage.setItem("idCounter", paletteIDCounter.value);
  }

  /**
   * Adds a new colour to the `colourSwatches` array if it's not already present.
   * @param {string} colourHexToAdd - The hex colour string to add.
   */
  function addColour(colourHexToAdd) {
    if (!colourSwatches.value.includes(colourHexToAdd)) {
      colourSwatches.value.unshift(colourHexToAdd);
      updateURLData();
    }
  }

  /**
   * Removes a specified colour from the `colourSwatches` array.
   * @param {string} colourHexToRemove - The hex colour string to remove.
   */
  function removeColour(colourHexToRemove) {
    const index = colourSwatches.value.indexOf(colourHexToRemove);
    if (index > -1) {
      colourSwatches.value.splice(index, 1);
      if (colourHexToRemove === focusColour.value) {
        setFocusColour("");
      }
      updateURLData();
    }
  }

  /**
   * Updates the `savedTitle` with the current `paletteTitle` and updates the URL data.
   */
  function updatePaletteTitle() {
    savedTitle.value = paletteTitle.value;
    updateURLData();
  }

  /**
   * Formats the current `colourSwatches` into a URL-friendly query string.
   * @returns {string} The formatted colour string for URL.
   */
  function formatPaletteQueryString() {
    return colourSwatches.value.map(c => c.replace("#", "")).join("-");
  }

  /**
   * Updates the browser's URL query parameters based on the current active palette.
   */
  function updateURLData() {
    const coloursForURL = formatPaletteQueryString();
    const url = new URL(window.location);
    url.searchParams.set("colours", coloursForURL);

    const title = paletteTitle.value;
    if (title) url.searchParams.set("title", title);
    else url.searchParams.delete("title");

    const focus = focusColour.value.replace("#", "");
    if (focus) url.searchParams.set("focus", focus);
    else url.searchParams.delete("focus");

    url.searchParams.set("contrastMode", contrastMode.value);
    url.searchParams.set("cvdMode", cvdMode.value);
    url.searchParams.set("complianceMode", complianceMode.value);
    window.history.replaceState(history.state, "", url);
  }

  /**
   * Clears the current active colour palette, title, and focus colour.
   */
  function closeSample() {
    sampleColours.value = [];
  }

  function clearPalette() {
    colourSwatches.value = [];
    paletteTitle.value = "";
    setFocusColour("");
    updateURLData();
  }

  /**
   * Comparison function for sorting colour combinations based on their WCAG contrast ratio (descending).
   * @param {Array} a - The first colour combination array.
   * @param {Array} b - The second colour combination array.
   * @returns {number}
   */
  function compare(a, b) {
    return b[2] - a[2];
  }

  // Expose the store's state, getters, and actions
  return {
    // State
    complianceMode: readonly(complianceMode),
    contrastMode,
    cvdMode,
    palettes,
    paletteIDCounter,
    colourSwatches,
    focusColour,
    sampleColours,
    paletteTitle,
    savedTitle,

    // Getters
    isSampleMode,
    isTitleUnchanged,
    paletteCanBeArchived,
    complianceRatios,
    simulatedSwatchMap,
    uniqueColourCombinations,
    passColourCombinations,
    largePassColourCombinations,
    failColourCombinations,

    // Actions
    setComplianceMode,
    setContrastMode,
    setCVDMode,
    hideCVDPanel,
    setFocusColour,
    loadPaletteFromQueryString,
    addPaletteToLocalStorage,
    addColour,
    removeColour,
    updateURLData,
    updateLocalStorage,
    clearPalette,
    closeSample,
    updatePaletteTitle,
    loadPalettesFromLocalStorage,
    loadLocalPalette,
    deleteLocalPalette,
  };
});
