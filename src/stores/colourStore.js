import { ref, computed } from "vue";
import { defineStore } from "pinia";
import checkHexColourIsValid from "@/composables/checkHexColourIsValid";
import getColoursFromURL from "@/composables/getColoursFromURL";
import getTitleFromURL from "@/composables/getTitleFromURL";
import getFocusColourFromURL from "@/composables/getFocusColourFromURL";
import contrastRatio from "@/composables/calculateColourContrast";
import SearchArrayByItemPropertyValue from "@/composables/SearchArrayByItemPropertyValue";
// import hexToRGB from "@/composables/hexToRGB.js";
// import { APCAcontrast, sRGBtoY, alphaBlend } from "apca-w3";

// import { colorParsley } from "colorparsley";

const aaPassRatio = 4.5;
const aaPartialRatio = 3;
const aaaPassRatio = 7;
const aaaPartialRatio = 4.5;

export const useColourStore = defineStore("colourStore", () => {
  const complianceMode = ref("AA");

  const complianceModeGetSet = computed({
    get() {
      return complianceMode.value;
    },
    set(value) {
      complianceMode.value = value;
    },
  });

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

  /*
  Local Storage Set of Palettes
  =============================

  These are written to the localStorage as:

  "palettes"
  "paletteIDCounter"

  */

  const palettes = ref([]);

  const palettesGetSet = computed({
    get() {
      return palettes.value;
    },
    set(value) {
      palettes.value = value;
    },
  });

  const paletteIDCounter = ref(0);

  const paletteIDCounterGetSet = computed({
    get() {
      return paletteIDCounter.value;
    },
    set(value) {
      paletteIDCounter.value = value;
    },
  });

  /*
  Example Mode
  ============
  */

  const sampleColours = ref([]);

  const sampleColoursGetSet = computed({
    get() {
      return sampleColours.value;
    },
    set(value) {
      sampleColours.value = value;
    },
  });

  const isSampleMode = computed(() => {
    if (sampleColours.value.length) {
      return true;
    }

    return false;
  });

  /*
  Colour Swatches
  ===============
  */

  const colourSwatches = ref([]);

  const coloursGetSet = computed({
    get() {
      return colourSwatches.value;
    },
    set(value) {
      colourSwatches.value = value;
    },
  });

  const focusColour = ref("");

  const focusColourGetSet = computed({
    get() {
      return focusColour.value;
    },
    set(value) {
      focusColour.value = value;
      updateURLData();
    },
  });

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

  const passColourCombinations = computed(() => {
    const combos = [];
    uniqueColourCombinations.value.forEach((item) => {
      if (item[2] >= complianceRatios.value.max) {
        combos.push(item);
      }
    });

    return combos.sort(compare);
  });

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

  const failColourCombinations = computed(() => {
    const combos = [];
    uniqueColourCombinations.value.forEach((item) => {
      if (item[2] < complianceRatios.value.min) {
        combos.push(item);
      }
    });

    return combos.sort(compare);
  });

  /*
  Palette Title
  ===============
  */

  const paletteTitle = ref("");

  const paletteTitleGetSet = computed({
    get() {
      return paletteTitle.value;
    },
    set(value) {
      paletteTitle.value = value;
    },
  });

  const savedTitle = ref("");

  const isTitleUpdated = computed(() => {
    if (savedTitle.value === paletteTitle.value) {
      return true;
    }

    return false;
  });

  const paletteCanBeArchived = computed(() => {
    if (paletteTitle.value !== "" && colourSwatches.value.length > 0) {
      return true;
    }

    return false;
  });

  // Functions (Actions)

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

  function loadPalettesFromLocalStorage() {
    if (localStorage.getItem("palettes") && localStorage.getItem("idCounter")) {
      palettes.value = JSON.parse(localStorage.getItem("palettes"));
      paletteIDCounter.value = localStorage.getItem("idCounter");
    }
  }

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

  function updateLocalStorage() {
    localStorage.setItem("palettes", JSON.stringify(palettes.value));
    localStorage.setItem("idCounter", paletteIDCounter.value);
  }

  function addColour(colourHexToAdd) {
    const formattedHex = colourHexToAdd;
    if (!colourSwatches.value.includes(formattedHex)) {
      colourSwatches.value.unshift(formattedHex);
      this.updateURLData();
    }
  }

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

  function updatePaletteTitle() {
    this.savedTitle = paletteTitle.value;
    this.updateURLData();
  }

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

  function clearPalette() {
    this.colourSwatches = [];
    this.listTitle = "";
    this.focusColourGetSet = "";
    this.updateURLData();
  }

  function compare(a, b) {
    if (a[2] > b[2]) {
      return -1;
    }
    if (a[2] < b[2]) {
      return 1;
    }
    return 0;
  }

  // Store API
  return {
    complianceModeGetSet,
    palettesGetSet,
    paletteIDCounterGetSet,
    colourSwatches,
    colours: coloursGetSet,
    listTitle: paletteTitleGetSet,
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
