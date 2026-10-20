import { richMotionAllowed, watchMotionPreference } from './motion-policy.js';

const guide = document.querySelector('#qbit-guide');
const launcher = document.querySelector('#qbit-launcher');
const panel = document.querySelector('#qbit-panel');
const motionButton = document.querySelector('#qbit-motion');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let localPaused = false;
let sitePaused = document.body.classList.contains('motion-paused');
let open = false;
const stops = [
  ['top', 'Hey, I’m Qbit.', 'Your little guide to big digital ideas. Let’s find something for you.', 'Explore our products'],
  ['products', 'Explore our products.', 'Meet Scaler Profile, Zevaris AI, Serlow and Decision Sphere, and see where each product is in development.', 'Explore services'],
  ['services', 'What are you building?', 'Explore the capabilities and deliverables, then tell us what your project needs.', 'Meet the team'],
  ['about', 'Meet your collaborators.', 'Get to know QIXARC and how we take a project from first idea to launch.', 'Start a conversation'],
  ['contact', 'Let’s make it happen.', 'Tell us about your idea. The form securely sends your enquiry to the QIXARC team.', 'Back to the top']
];
if (document.body.dataset.page) {
  stops[3][3] = 'Explore R&D';
  stops.splice(4, 0, ['research', 'Questions worth exploring.', 'Discover the questions behind purposeful prototypes and our approach to research.', 'Read the journal']);
  stops.splice(5, 0, ['blog', 'Ideas behind the interface.', 'Read design notes about the choices that shape useful digital experiences.', 'Start a conversation']);
  stops[0][3] = 'Hear our story';
  stops.splice(1, 0, ['story', 'Let me tell you our story.', 'Follow the chapters from Kabibalan’s first steps to the QIXARC product lineup.', 'Meet our products']);
}
let active = 0;
function showStop(index) {
  active = index;
  document.querySelector('#qbit-title').textContent = stops[index][1];
  document.querySelector('#qbit-tip').textContent = stops[index][2];
  const next = document.querySelector('#qbit-next');
  next.textContent = `${stops[index][3]} ↗`;
  const nextId = stops[(index + 1) % stops.length][0];
  next.href = document.body.dataset.page ? (nextId === 'top' ? '/' : `/${nextId}/`) : `#${nextId}`;
  document.querySelector('#qbit-step').textContent = `${String(index + 1).padStart(2, '0')} / ${String(stops.length).padStart(2, '0')}`;
}
function setOpen(value) {
  open = value;
  panel.hidden = !value;
  launcher.setAttribute('aria-expanded', String(value));
  launcher.setAttribute('aria-label', value ? 'Minimize Qbit website guide' : 'Open Qbit website guide');
  guide.classList.toggle('is-open', value);
}
launcher.addEventListener('click', () => setOpen(!open));
document.querySelector('#qbit-close').addEventListener('click', () => { setOpen(false); launcher.focus(); });
guide.addEventListener('keydown', event => {
  if (event.key === 'Escape') { setOpen(false); launcher.focus(); }
});
document.querySelectorAll('#qbit-panel a').forEach(link => link.addEventListener('click', event => {
  const id = link.hash.slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  const index = stops.findIndex(stop => stop[0] === id);
  if (index !== -1) showStop(index);
  if (matchMedia('(max-width: 1100px)').matches) setOpen(false);
  const heading = target.querySelector('h1, h2') || target;
  heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
  const behavior = reduced.matches || sitePaused || localPaused ? 'instant' : 'smooth';
  if (id === 'top') window.scrollTo({ top: 0, behavior });
  else target.scrollIntoView({ behavior, block: 'start' });
}));
let scrollQueued = false;
function trackSection() {
  scrollQueued = false;
  if (document.body.dataset.page) { showStop(Math.max(0, stops.findIndex(stop => stop[0] === document.body.dataset.page.split('/')[0]))); return; }
  let index = 0;
  stops.forEach((stop, i) => { if (document.getElementById(stop[0]).getBoundingClientRect().top <= innerHeight * 0.45) index = i; });
  if (index !== active) showStop(index);
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(trackSection); }
}, { passive: true });
showStop(0);
trackSection();

const isPaused = () => reduced.matches || sitePaused || localPaused;
function updateMotionLabel() {
  motionButton.setAttribute('aria-pressed', String(isPaused()));
  motionButton.textContent = reduced.matches || sitePaused ? 'Motion paused' : localPaused ? 'Resume Qbit' : 'Pause Qbit';
  motionButton.disabled = reduced.matches || sitePaused;
}
motionButton.addEventListener('click', () => { localPaused = !localPaused; updateMotionLabel(); });
window.addEventListener('qixarc-motion', event => { sitePaused = event.detail.paused; updateMotionLabel(); });
reduced.addEventListener('change', updateMotionLabel);
updateMotionLabel();
const storyMotion = document.querySelector('#story-motion');
if (storyMotion) {
  storyMotion.hidden = false;
  const syncStoryMotion = () => { storyMotion.setAttribute('aria-pressed', String(isPaused())); storyMotion.textContent = isPaused() ? 'Resume QBit ▷' : 'Pause QBit Ⅱ'; storyMotion.disabled = reduced.matches || sitePaused; };
  storyMotion.addEventListener('click', () => { localPaused = !localPaused; updateMotionLabel(); syncStoryMotion(); });
  motionButton.addEventListener('click', syncStoryMotion);
  window.addEventListener('qixarc-motion', syncStoryMotion);
  reduced.addEventListener('change', syncStoryMotion);
  syncStoryMotion();
}

let visualStarted = false;
function startVisual() {
  if (visualStarted || !richMotionAllowed() || isPaused()) return;
  visualStarted = true;
  import('./guide-visual.js').then(module => module.startGuideVisual({ guide, launcher, isPaused, isOpen: () => open })).catch(() => { visualStarted = false; });
}
launcher.addEventListener('click', () => { if (open) startVisual(); });
const storyCanvas = document.querySelector('#qbit-story-canvas');
let storyVisible = false;
if (storyCanvas) new IntersectionObserver(entries => { storyVisible = entries[0].isIntersecting; if (storyVisible) startVisual(); }).observe(storyCanvas);
watchMotionPreference(() => { if (open || storyVisible) startVisual(); });
window.addEventListener('qixarc-motion', () => { if (open || storyVisible) startVisual(); });
