import getURLParam from "@/composables/getURLParam";

export default function getContrastModeFromURL() {
  const mode = getURLParam("contrastMode");
  return mode === "wcag" || mode === "apca" ? mode : false;
}
