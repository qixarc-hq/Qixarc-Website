const desktop = matchMedia('(min-width: 1101px) and (hover: hover) and (pointer: fine)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

let webglAvailable;
function supportsWebGL() {
  if (webglAvailable !== undefined) return webglAvailable;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) || canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true });
    webglAvailable = Boolean(context);
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch { webglAvailable = false; }
  return webglAvailable;
}

export function richMotionAllowed() {
  return desktop.matches && !reduced.matches && !navigator.connection?.saveData &&
    !(navigator.deviceMemory && navigator.deviceMemory <= 2) &&
    !(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) && supportsWebGL();
}

export function watchMotionPreference(callback) {
  desktop.addEventListener('change', callback);
  reduced.addEventListener('change', callback);
  navigator.connection?.addEventListener('change', callback);
}
