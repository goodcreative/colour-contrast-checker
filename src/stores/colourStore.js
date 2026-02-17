import { ref, computed } from "vue";
import { defineStore } from "pinia";
import checkHexColourIsValid from "@/composables/checkHexColourIsValid";
import getColoursFromURL from "@/composables/getColoursFromURL";
import getTitleFromURL from "@/composables/getTitleFromURL";
import getFocusColourFromURL from "@/composables/getFocusColourFromURL";
import contrastRatio from "@/composables/calculateColourContrast";
import SearchArrayByItemPropertyValue from "@/composables/SearchArrayByItemPropertyValue";
import hexToRGB from "@/composables/hexToRGB.js";
import { APCAcontrast, sRGBtoY, alphaBlend } from "apca-w3";

import { colorParsley } from "colorparsley";

const aaPassRatio = 4.5;
const aaPartialRatio = 3;
const aaaPassRatio = 7;
const aaaPartialRatio = 4.5;

/**
 * @typedef {Object} Palette
 * @property {string[]} colours - An array of hex color strings.
 * @property {number} id - Unique ID for the palette.
 * @property {string} title - The title of the palette.
 */

/**
 * @typedef {Object} ComplianceRatios
 * @property {number} min - The minimum contrast ratio for compliance.
 * @property {number} max - The maximum contrast ratio for compliance.
 */

/**
 * Pinia store for managing colour palettes, compliance modes, and contrast calculations.
 *
 * This store handles:
 * - Setting and getting WCAG compliance modes (AA, AAA).
 * - Storing and managing user-defined colour palettes.
 * - Calculating contrast ratios for colour combinations.
 * - Managing sample colours for testing.
 * - Interacting with local storage for persistence.
 */
export const useColourStore = defineStore("colourStore", () => {
  /**
   * The currently selected WCAG compliance mode ('AA' or 'AAA').
   * @type {import('vue').Ref<string>}
   */
  const complianceMode = ref("AA");

  /**
   * Getter/Setter for the compliance mode.
   * @type {import('vue').ComputedRef<string>}
   */
  const complianceModeGetSet = computed({
    get() {
      return complianceMode.value;
    },
    set(value) {
      complianceMode.value = value;
    },
  });

  /**
   * Computed property that returns the min/max contrast ratios based on the current compliance mode.
   * @type {import('vue').ComputedRef<ComplianceRatios|false>}
   */
  const complianceRatios = computed(() => {
    if (complianceMode.value === "AA") {
      return {
        min: aaPartialRatio,
        max: aaPassRatio,
      };
    } else if (complianceMode.value === "AAA") {
      return {
        min: aaaPartialRatio,
        max: aaaPassRatio,
      };
    } else {
      return false;
    }
  });

  /**
   * Array of saved colour palettes.
   * @type {import('vue').Ref<Palette[]>}
   */
  const palettes = ref([]);

  /**
   * Getter/Setter for the palettes array.
   * @type {import('vue').ComputedRef<Palette[]>}
   */
  const palettesGetSet = computed({
    get() {
      return palettes.value;
    },
    set(value) {
      palettes.value = value;
    },
  });

  /**
   * Counter for generating unique palette IDs.
   * @type {import('vue').Ref<number>}
   */
  const paletteIDCounter = ref(0);

  /**
   * Getter/Setter for the palette ID counter.
   * @type {import('vue').ComputedRef<number>}
   */
  const paletteIDCounterGetSet = computed({
    get() {
      return paletteIDCounter.value;
    },
    set(value) {
      paletteIDCounter.value = value;
    },
  });

  /**
   * Colours used in "sample mode" for temporary testing or demonstration.
   * @type {import('vue').Ref<string[]>}
   */
  const sampleColours = ref([]);

  /**
   * Getter/Setter for sample colours.
   * @type {import('vue').ComputedRef<string[]>}
   */
  const sampleColoursGetSet = computed({
    get() {
      return sampleColours.value;
    },
    set(value) {
      sampleColours.value = value;
    },
  });

  /**
   * Indicates if the app is currently in sample mode (i.e., `sampleColours` has items).
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isSampleMode = computed(() => {
    if (sampleColours.value.length) {
      return true;
    }

    return false;
  });

  /**
   * The main array of colour swatches currently being displayed/analyzed.
   * @type {import('vue').Ref<string[]>}
   */
  const colourSwatches = ref([]);

  /**
   * Getter/Setter for the main colour swatches array.
   * @type {import('vue').ComputedRef<string[]>}
   */
  const coloursGetSet = computed({
    get() {
      return colourSwatches.value;
    },
    set(value) {
      colourSwatches.value = value;
    },
  });

  /**
   * The currently focused colour, used for filtering combinations.
   * @type {import('vue').Ref<string>}
   */
  const focusColour = ref("");

  /**
   * Getter/Setter for the focus colour. Updates the URL when set.
   * @type {import('vue').ComputedRef<string>}
   */
  const focusColourGetSet = computed({
    get() {
      return focusColour.value;
    },
    set(value) {
      focusColour.value = value;
      updateURLData();
    },
  });

  /**
   * Computes all unique colour combinations from `colourSwatches` and their WCAG contrast ratios.
   * If `focusColour` is set, only combinations involving the focus colour are returned.
   * Each combination is an array: `[colour1, colour2, wcagContrastRatio]`.
   * @type {import('vue').ComputedRef<Array<[string, string, number]>>}
   */
  const uniqueColourCombinations = computed(() => {
    let uniqueCombinations = [];
    const colours = [...colourSwatches.value].sort();

    let primaryColourSet = [];

    if (focusColour.value !== "") {
      primaryColourSet.push(focusColour.value);
    } else {
      primaryColourSet = colours;
    }

    let a;

    primaryColourSet.forEach((firstColour) => {
      colours.forEach((secondColour) => {
        if (firstColour !== secondColour) {
          const colourPair = [];
          colourPair.push(firstColour);
          colourPair.push(secondColour);

          if (focusColour.value === "") {
            colourPair.sort();
          }

          colourPair.push(
            Math.round(contrastRatio(firstColour, secondColour) * 100) / 100
          );

          // let apacContrast = APCAcontrast(
          //   sRGBtoY(
          //     alphaBlend(colorParsley(firstColour), colorParsley(secondColour))
          //   ),
          //   sRGBtoY(colorParsley(secondColour))
          // );

          //colourPair.push(apacContrast);

          uniqueCombinations.push(colourPair);
        }
      });
    });

    uniqueCombinations = uniqueCombinations.filter(
      ((a = {}), (b) => !(a[b] = b in a))
    );

    return uniqueCombinations;
  });

  /**
   * Computed property returning colour combinations that fully pass the current compliance mode.
   * Each item is `[colour1, colour2, wcagContrastRatio]`.
   * @type {import('vue').ComputedRef<Array<[string, string, number]>>}
   */
  const passColourCombinations = computed(() => {
    const combos = [];
    uniqueColourCombinations.value.forEach((item) => {
      if (item[2] >= complianceRatios.value.max) {
        combos.push(item);
      }
    });

    return combos.sort(compare);
  });

  /**
   * Computed property returning colour combinations that partially pass (large text)
   * the current compliance mode.
   * Each item is `[colour1, colour2, wcagContrastRatio]`.
   * @type {import('vue').ComputedRef<Array<[string, string, number]>>}
   */
  const largePassColourCombinations = computed(() => {
    const combos = [];
    uniqueColourCombinations.value.forEach((item) => {
      if (
        item[2] >= complianceRatios.value.min &&
        item[2] < complianceRatios.value.max
      ) {
        combos.push(item);
      }
    });

    return combos.sort(compare);
  });

  /**
   * Computed property returning colour combinations that fail the current compliance mode.
   * Each item is `[colour1, colour2, wcagContrastRatio]`.
   * @type {import('vue').ComputedRef<Array<[string, string, number]>>}
   */
  const failColourCombinations = computed(() => {
    const combos = [];
    uniqueColourCombinations.value.forEach((item) => {
      if (item[2] < complianceRatios.value.min) {
        combos.push(item);
      }
    });

    return combos.sort(compare);
  });

  /**
   * The current title for the active colour palette.
   * @type {import('vue').Ref<string>}
   */
  const paletteTitle = ref("");

  /**
   * Getter/Setter for the palette title.
   * @type {import('vue').ComputedRef<string>}
   */
  const paletteTitleGetSet = computed({
    get() {
      return paletteTitle.value;
    },
    set(value) {
      paletteTitle.value = value;
    },
  });

  /**
   * Stores the last saved title of the palette, used for comparison.
   * @type {import('vue').Ref<string>}
   */
  const savedTitle = ref("");

  /**
   * Indicates if the current palette title has been updated compared to the last saved title.
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isTitleUpdated = computed(() => {
    if (savedTitle.value === paletteTitle.value) {
      return true;
    }

    return false;
  });

  /**
   * Indicates if the current palette can be archived (has a title and colours).
   * @type {import('vue').ComputedRef<boolean>}
   */
  const paletteCanBeArchived = computed(() => {
    if (paletteTitle.value !== "" && colourSwatches.value.length > 0) {
      return true;
    }

    return false;
  });

  /**
   * Loads colour palette data from the URL query string.
   * Parses colours, title, and focus colour from the URL and updates the store's state.
   */
  function loadPaletteFromQueryString() {
    this.colourSwatches = [];

    const coloursInURL = getColoursFromURL();

    if (coloursInURL) {
      // Separate values by comma
      const coloursToAdd = coloursInURL.split("-");
      // Format each value to a hex colour, check that it matches hex regex
      // and push to state
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
      focusColourGetSet.value = focusColourInURL;
    }
  }

  /**
   * Loads a saved palette from the local store into the active palette.
   * @param {number} id - The ID of the palette to load.
   */
  function loadLocalPalette(id) {
    let localPalette = SearchArrayByItemPropertyValue(id, "id", palettes.value);

    let newColours = Object.assign([], localPalette.colours);
    let newTitle = localPalette.title;

    colourSwatches.value = newColours;
    paletteTitle.value = newTitle;
    savedTitle.value = newTitle;
    focusColour.value = "";

    updateURLData();
  }

  /**
   * Deletes a saved palette from the local store.
   * @param {number} id - The ID of the palette to delete.
   */
  function deleteLocalPalette(id) {
    let localPalette = SearchArrayByItemPropertyValue(id, "id", palettes.value);

    let indexOfPaletteToDelete = palettes.value.indexOf(localPalette);

    if (indexOfPaletteToDelete === 0) {
      palettes.value.shift();
    } else {
      palettes.value.splice(indexOfPaletteToDelete, indexOfPaletteToDelete);
    }

    updateLocalStorage();
  }

  /**
   * Loads all saved palettes and the ID counter from browser local storage.
   */
  function loadPalettesFromLocalStorage() {
    if (localStorage.getItem("palettes") && localStorage.getItem("idCounter")) {
      palettes.value = JSON.parse(localStorage.getItem("palettes"));
      paletteIDCounter.value = localStorage.getItem("idCounter");
    }
  }

  /**
   * Adds the current active palette to the local storage, if it has a title.
   */
  function addPaletteToLocalStorage() {
    window.console.log(palettes);
    // Needs a title
    if (paletteTitle.value !== "") {
      let savedPalette = {};

      let newColours = Object.assign([], colourSwatches.value);

      savedPalette.colours = newColours;
      savedPalette.id = paletteIDCounter.value;
      savedPalette.title = paletteTitle.value;

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
   * Adds a new colour (hex string) to the beginning of the `colourSwatches` array,
   * if it's not already present. Updates the URL data.
   * @param {string} colourHexToAdd - The hex colour string to add (e.g., "#RRGGBB").
   */
  function addColour(colourHexToAdd) {
    const formattedHex = colourHexToAdd;
    if (!colourSwatches.value.includes(formattedHex)) {
      colourSwatches.value.unshift(formattedHex);
      this.updateURLData();
    }
  }

  /**
   * Removes a specified colour (hex string) from the `colourSwatches` array.
   * If the removed colour was the focus colour, resets the focus colour.
   * Updates the URL data.
   * @param {string} colourHexToRemove - The hex colour string to remove.
   */
  function removeColour(colourHexToRemove) {
    const colourArray = colourSwatches;

    if (colourArray.value.indexOf(colourHexToRemove) > -1) {
      const indexOfColour = colourArray.value.indexOf(colourHexToRemove);
      colourArray.value.splice(indexOfColour, 1);
      this.colourSwatches = colourArray;
      if (colourHexToRemove === focusColourGetSet.value) {
        focusColourGetSet.value = "";
      }
      this.updateURLData();
    }
  }

  /**
   * Updates the `savedTitle` with the current `paletteTitle` and updates the URL data.
   */
  function updatePaletteTitle() {
    this.savedTitle = paletteTitle.value;
    this.updateURLData();
  }

  /**
   * Formats the current `colourSwatches` into a URL-friendly query string.
   * Example: "#FF0000", "#000000" becomes "FF0000-000000".
   * @returns {string} The formatted colour string for URL.
   */
  function formatPaletteQueryString() {
    const colourArray = colourSwatches;
    let colourStringForURL = "";

    colourArray.value.forEach((element) => {
      const formattedColour = element.replace("#", "");

      colourStringForURL = colourStringForURL + "-" + formattedColour;
    });

    if (colourStringForURL.charAt(0) === "-") {
      colourStringForURL = colourStringForURL.slice(1);
    }

    return colourStringForURL;
  }

  /**
   * Updates the browser's URL query parameters based on the current active palette's
   * colours, title, and focus colour.
   */
  function updateURLData() {
    const coloursForURL = formatPaletteQueryString();
    const paletteTitle = paletteTitleGetSet.value;
    const focusColour = focusColourGetSet.value.replace("#", "");
    const currState = history.state;

    const url = new URL(window.location);
    url.searchParams.set("colours", coloursForURL);
    url.searchParams.set("title", paletteTitle);
    url.searchParams.set("focus", focusColour);
    window.history.pushState(currState, "", url);
  }

  /**
   * Clears the current active colour palette, title, and focus colour.
   * Updates the URL data.
   */
  function clearPalette() {
    this.colourSwatches = [];
    this.listTitle = "";
    this.focusColourGetSet = "";
    this.updateURLData();
  }

  /**
   * Comparison function for sorting colour combinations based on their WCAG contrast ratio (descending).
   * Used by `passColourCombinations`, `largePassColourCombinations`, and `failColourCombinations`.
   * @param {Array} a - The first colour combination array.
   * @param {Array} b - The second colour combination array.
   * @returns {number} -1 if a > b, 1 if a < b, 0 if equal.
   */
  function compare(a, b) {
    if (a[2] > b[2]) {
      return -1;
    }
    if (a[2] < b[2]) {
      return 1;
    }
    return 0;
  }

  // Expose the store's state, getters, and actions
  return {
    complianceModeGetSet,
    palettesGetSet,
    paletteIDCounterGetSet,
    colourSwatches,
    colours: coloursGetSet, // Alias for colourSwatches
    listTitle: paletteTitleGetSet, // Alias for paletteTitle
    focusColourGetSet,
    sampleColoursGetSet,
    isSampleMode,
    paletteTitle,
    uniqueColourCombinations,
    passColourCombinations,
    largePassColourCombinations,
    failColourCombinations,
    loadPaletteFromQueryString,
    addPaletteToLocalStorage,
    addColour,
    removeColour,
    updateURLData,
    updateLocalStorage,
    clearPalette,
    updatePaletteTitle,
    isTitleUpdated,
    savedTitle,
    loadPalettesFromLocalStorage,
    loadLocalPalette,
    deleteLocalPalette,
    paletteCanBeArchived,
    complianceRatios,
  };
});
