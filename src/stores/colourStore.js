import { ref, computed, readonly } from "vue";
import { defineStore } from "pinia";
import parsePaletteFromURL from "@/composables/parsePaletteFromURL";
import { createBrowserUrlAdapter } from "@/adapters/browserUrlAdapter";
import { createBrowserStorageAdapter } from "@/adapters/browserStorageAdapter";

let _urlPort = createBrowserUrlAdapter();
let _storagePort = createBrowserStorageAdapter();

/**
 * Replace browser adapters with test doubles. Call in beforeEach.
 */
export function setAdapters(urlPort, storagePort) {
  _urlPort = urlPort;
  _storagePort = storagePort;
}
import searchArrayByProperty from "@/composables/SearchArrayByItemPropertyValue";
import simulateCVD from "@/composables/simulateCVD.js";
import { contrastConfig } from "@/config/contrastConfig.js";
import { buildCategorizedCombinations } from "@/composables/buildCategorizedCombinations.js";

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
   * Categorized colour combinations (pass/largePass/fail) computed via the
   * extracted buildCategorizedCombinations composable.
   * @type {import('vue').ComputedRef<{pass: Array, largePass: Array, fail: Array}>}
   */
  const categorizedCombinations = computed(() =>
    buildCategorizedCombinations({
      swatches: colourSwatches.value,
      contrastMode: contrastMode.value,
      complianceLevel: complianceMode.value,
      cvdMode: cvdMode.value,
      focusColour: focusColour.value || null,
    })
  );

  const passColourCombinations = computed(() => categorizedCombinations.value.pass);
  const largePassColourCombinations = computed(() => categorizedCombinations.value.largePass);
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
    const { colours, title, focusColour: focus, contrastMode: cm, cvdMode: cvd, complianceMode: compliance }
      = parsePaletteFromURL('http://localhost/' + _urlPort.getSearch());

    colourSwatches.value = colours;

    paletteTitle.value = title ?? "";
    savedTitle.value = title ?? "";

    if (focus) setFocusColour(focus);
    if (cm) contrastMode.value = cm;
    if (cvd) cvdMode.value = cvd;
    if (compliance) complianceMode.value = compliance;
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
    const raw = _storagePort.load("palettes");
    const counter = _storagePort.load("idCounter");
    if (raw && counter) {
      palettes.value = JSON.parse(raw);
      paletteIDCounter.value = parseInt(counter, 10);
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
    _storagePort.save("palettes", JSON.stringify(palettes.value));
    _storagePort.save("idCounter", paletteIDCounter.value);
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
    const focus = focusColour.value.replace("#", "");
    _urlPort.setParams({
      colours: formatPaletteQueryString(),
      title: paletteTitle.value || null,
      focus: focus || null,
      contrastMode: contrastMode.value,
      cvdMode: cvdMode.value,
      complianceMode: complianceMode.value,
    });
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

  function swatchOrderChanged() {
    updateURLData();
  }

  function paletteOrderChanged() {
    updateLocalStorage();
  }

  function init() {
    loadPaletteFromQueryString();
    loadPalettesFromLocalStorage();
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
    swatchOrderChanged,
    paletteOrderChanged,
    clearPalette,
    closeSample,
    updatePaletteTitle,
    loadPalettesFromLocalStorage,
    loadLocalPalette,
    deleteLocalPalette,
    init,
  };
});
