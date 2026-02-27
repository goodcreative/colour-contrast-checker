/**
 * Calculate the contrast ratio between two colours.
 *
 * Colours should be in rgb() or 3/6-digit hex format; order does not matter
 * (ie. it doesn't matter which is the lighter and which is the darker).
 * Values should be in the range [1.0, 21.0]... a ratio of 1.0 means "they're
 * exactly the same contrast", 21.0 means it's white-on-black or v.v.
 * Formula as per WCAG 2.0 definitions.
 *
 * @param {String} colour1 The first colour to compare.
 * @param {String} colour2 The second colour to compare.
 *
 * @returns {Number}
 */
export default function contrastRatio(colour1, colour2) {
  var ratio = (0.05 + relativeLum(colour1)) / (0.05 + relativeLum(colour2));
  if (ratio < 1) {
    ratio = 1 / ratio;
  }

  return ratio;
}

/**
 * Calculate relative luminescence for a colour in the sRGB colour profile.
 *
 * Supports rgb() and hex colours. rgba() also supported but the alpha
 * channel is currently ignored.
 * Hex colours can have an optional "#" at the front, which is stripped.
 * Relative luminescence formula is defined in the definitions of WCAG 2.0.
 * It can be either three or six hex digits, as per CSS conventions.
 * It should return a value in the range [0.0, 1.0].
 *
 * @param {String} colour The colour to calculate from.
 *
 * @returns {Number}
 */
function relativeLum(sourceColour) {
  if (sourceColour.charAt) {
    var colour = colourStrToRGB(sourceColour);
  }

  var transformed = {};
  for (var x in colour) {
    if (colour[x] <= 0.03928) {
      transformed[x] = colour[x] / 12.92;
    } else {
      transformed[x] = Math.pow((colour[x] + 0.055) / 1.055, 2.4);
    }
  } //end for

  var lum =
    transformed.red * 0.2126 +
    transformed.green * 0.7152 +
    transformed.blue * 0.0722;
  return lum;
}

/**
 * Convert a colour string to a structure with red/green/blue elements.
 *
 * Supports rgb() and hex colours (3 or 6 hex digits, optional "#").
 * rgba() also supported but the alpha channel is currently ignored.
 * Each red/green/blue element is in the range [0.0, 1.0].
 *
 * @param {String} colour The colour to convert.
 *
 * @returns {Object}
 */
function colourStrToRGB(colour) {
  colour = colour.toLowerCase();

  if (colour.substring(0, 3) === "rgb") {
    // rgb[a](0, 0, 0[, 0]) format.
    var matches = /^rgba?\s*\((\d+),\s*(\d+),\s*(\d+)([^)]*)\)$/.exec(colour);
    colour = {
      red: matches[1] / 255,
      green: matches[2] / 255,
      blue: matches[3] / 255,
    };
  } else {
    // Hex digit format.
    if (colour.charAt(0) === "#") {
      colour = colour.substr(1);
    }

    if (colour.length === 3) {
      colour = colour.replace(/^(.)(.)(.)$/, "$1$1$2$2$3$3");
    }

    colour = {
      red: parseInt(colour.substr(0, 2), 16) / 255,
      green: parseInt(colour.substr(2, 2), 16) / 255,
      blue: parseInt(colour.substr(4, 2), 16) / 255,
    };
  }

  return colour;
}

