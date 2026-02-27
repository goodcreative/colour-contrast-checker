import getURLParam from "@/composables/getURLParam";

export default function getFocusColourFromURL() {
  const value = getURLParam("focus");
  return value ? "#" + value : false;
}
