export default function checkHexColourIsValid(hexColour) {
  const hexRegex = new RegExp("^#(?:[0-9a-fA-F]{3}){1,2}$");
  return hexRegex.test(hexColour);
}
