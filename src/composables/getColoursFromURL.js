import getURLParam from "@/composables/getURLParam";

export default function getColoursFromURL() {
  return getURLParam("colours") || false;
}
