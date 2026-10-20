import { richMotionAllowed, watchMotionPreference } from './motion-policy.js';

const canvas = document.querySelector('#brand-canvas');
let visible = false;
let loading = false;
function loadScene() {
  if (!canvas || loading || !visible || !richMotionAllowed() || document.body.classList.contains('motion-paused')) return;
  loading = true;
  import('./scene.js?v=responsive-2').catch(() => { loading = false; });
}
if (canvas && 'IntersectionObserver' in window) {
  // Wait for the heading font to settle before deciding whether 3D is on screen.
  document.fonts.ready.then(() => {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; loadScene(); }).observe(canvas);
  });
  watchMotionPreference(loadScene);
  window.addEventListener('qixarc-motion', loadScene);
}
