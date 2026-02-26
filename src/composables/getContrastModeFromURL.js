export default function getContrastModeFromURL() {
  const params = new URLSearchParams(new URL(window.location.href).search);
  const mode = params.get('contrastMode');
  return (mode === 'wcag' || mode === 'apca') ? mode : false;
}
