const desktop = matchMedia('(min-width: 1101px) and (hover: hover) and (pointer: fine)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

export function richMotionAllowed() {
  return desktop.matches && !reduced.matches && !navigator.connection?.saveData &&
    !(navigator.deviceMemory && navigator.deviceMemory <= 2) &&
    !(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
}

export function watchMotionPreference(callback) {
  desktop.addEventListener('change', callback);
  reduced.addEventListener('change', callback);
  navigator.connection?.addEventListener('change', callback);
}
