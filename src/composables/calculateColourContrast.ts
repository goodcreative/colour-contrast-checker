/**
 * Calculate the contrast ratio between two colours.
 *
 * Colours should be in rgb() or 3/6-digit hex format; order does not matter
 * (ie. it doesn't matter which is the lighter and which is the darker).
 * Values should be in the range [1.0, 21.0]... a ratio of 1.0 means "they're
 * exactly the same contrast", 21.0 means it's white-on-black or v.v.
 * Formula as per WCAG 2.0 definitions.
 *
 * @param colour1 The first colour to compare.
 * @param colour2 The second colour to compare.
 */
export default function contrastRatio(colour1: string, colour2: string): number {
  let ratio = (0.05 + relativeLum(colour1)) / (0.05 + relativeLum(colour2));
  if (ratio < 1) {
    ratio = 1 / ratio;
  }

  return ratio;
}

/** An sRGB colour with each channel normalised to the range [0.0, 1.0]. */
interface RGBFraction {
  red: number;
  green: number;
  blue: number;
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
 * @param sourceColour The colour to calculate from.
 */
function relativeLum(sourceColour: string): number {
  if (typeof sourceColour !== 'string') {
    throw new TypeError('relativeLum expects a string colour value');
  }

  const colour = colourStrToRGB(sourceColour);
  const transformed: RGBFraction = { red: 0, green: 0, blue: 0 };

  (Object.keys(colour) as Array<keyof RGBFraction>).forEach((x) => {
    if (colour[x] <= 0.03928) {
      transformed[x] = colour[x] / 12.92;
    } else {
      transformed[x] = Math.pow((colour[x] + 0.055) / 1.055, 2.4);
    }
  });

  const lum =
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
 * @param colour The colour to convert.
 */
function colourStrToRGB(colour: string): RGBFraction {
  colour = colour.toLowerCase();

  if (colour.substring(0, 3) === "rgb") {
    // rgb[a](0, 0, 0[, 0]) format.
    const matches = /^rgba?\s*\((\d+),\s*(\d+),\s*(\d+)([^)]*)\)$/.exec(colour);
    if (!matches) {
      throw new TypeError(`Unparseable rgb() colour: ${colour}`);
    }
    return {
      red: Number(matches[1]) / 255,
      green: Number(matches[2]) / 255,
      blue: Number(matches[3]) / 255,
    };
  }

  // Hex digit format.
  let hex = colour.charAt(0) === "#" ? colour.substring(1) : colour;

  if (hex.length === 3) {
    hex = hex.replace(/^(.)(.)(.)$/, "$1$1$2$2$3$3");
  }

  return {
    red: parseInt(hex.substring(0, 2), 16) / 255,
    green: parseInt(hex.substring(2, 4), 16) / 255,
    blue: parseInt(hex.substring(4, 6), 16) / 255,
  };
}
