export default function getURLParam(key) {
  const params = new URLSearchParams(new URL(window.location.href).search);
  return params.get(key);
}
