import getURLParam from "@/composables/getURLParam";

export default function getTitleFromURL() {
  return getURLParam("title") || false;
}
