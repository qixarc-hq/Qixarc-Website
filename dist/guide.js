import * as THREE from './assets/three.module.min.js';

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
  ['products', 'Explore our products.', 'Meet Scaler Profile, Zevaris AI, Serlow and DecisionSphere, and see where each product is in development.', 'Explore services'],
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
  if (matchMedia('(max-width: 760px)').matches) setOpen(false);
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

// A tiny original robot built from geometry; no external model or image downloads.
try {
  const canvas = document.querySelector('#qbit-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(112, 112, false);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
  camera.position.set(0, 0.25, 7.7);
  const robot = new THREE.Group();
  scene.add(robot);
  const blue = new THREE.MeshStandardMaterial({ color: 0x2445f5, metalness: 0.35, roughness: 0.28 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0b1630, roughness: 0.25 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xdbeafe, metalness: 0.5, roughness: 0.3 });
  const glow = new THREE.MeshBasicMaterial({ color: 0x61e8ff });
  function orb(parent, material, position, scale) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), material);
    mesh.position.set(...position); mesh.scale.set(...scale); parent.add(mesh); return mesh;
  }
  orb(robot, blue, [0, 0.42, 0], [0.95, 0.76, 0.62]);
  orb(robot, dark, [0, 0.45, 0.5], [0.75, 0.43, 0.22]);
  const eyes = [-0.29, 0.29].map(x => orb(robot, glow, [x, 0.5, 0.71], [0.11, 0.16, 0.05]));
  orb(robot, silver, [0, -0.5, 0], [0.57, 0.45, 0.43]);
  orb(robot, blue, [0, -0.5, 0.38], [0.24, 0.23, 0.07]);
  orb(robot, glow, [0, -0.5, 0.45], [0.09, 0.09, 0.02]);
  [-1, 1].forEach(side => {
    orb(robot, silver, [side * 0.95, 0.4, 0], [0.15, 0.27, 0.27]);
    orb(robot, blue, [side * 0.32, -0.91, 0.12], [0.25, 0.15, 0.32]);
  });
  const arm = new THREE.Group(); arm.position.set(0.62, -0.24, 0); robot.add(arm);
  orb(arm, blue, [0.2, 0.15, 0], [0.15, 0.38, 0.17]);
  orb(robot, blue, [-0.69, -0.43, 0], [0.16, 0.32, 0.17]);
  orb(robot, silver, [0, 1.2, 0], [0.055, 0.22, 0.055]);
  orb(robot, glow, [0, 1.4, 0], [0.13, 0.13, 0.13]);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x172554, 3));
  const key = new THREE.DirectionalLight(0xffffff, 4); key.position.set(-3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x843cff, 3); rim.position.set(3, 1, -2); scene.add(rim);
  let storyRenderer;
  const storyCanvas = document.querySelector('#qbit-story-canvas');
  const storyCamera = camera.clone();
  if (storyCanvas) {
    try {
      storyRenderer = new THREE.WebGLRenderer({ canvas: storyCanvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      storyRenderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      storyCamera.position.z = 6.6;
      new ResizeObserver(() => {
        if (!storyRenderer) return;
        const width = storyCanvas.clientWidth, height = storyCanvas.clientHeight;
        if (!width || !height) return;
        storyRenderer.setSize(width, height, false);
        storyCamera.aspect = width / height; storyCamera.updateProjectionMatrix();
        storyRenderer.render(scene, storyCamera);
      }).observe(storyCanvas);
      storyCanvas.parentElement.classList.add('has-3d');
      storyCanvas.addEventListener('webglcontextlost', event => { event.preventDefault(); storyRenderer = null; storyCanvas.parentElement.classList.remove('has-3d'); });
    } catch { storyRenderer = null; }
  }
  let pointerX = 0;
  launcher.addEventListener('pointermove', event => {
    const box = launcher.getBoundingClientRect(); pointerX = ((event.clientX - box.left) / box.width - 0.5) * 0.5;
  });
  launcher.addEventListener('pointerleave', () => { pointerX = 0; });
  renderer.render(scene, camera);
  guide.classList.add('has-3d');
  let last = 0, elapsed = 0, lost = false;
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lost = true; guide.classList.remove('has-3d');
  });
  function animate(time) {
    if (lost) return;
    requestAnimationFrame(animate);
    if (document.hidden || isPaused()) { last = time; return; }
    if (time - last < 40) return;
    elapsed += Math.min((time - last) / 1000, 0.05); last = time;
    robot.position.y = Math.sin(elapsed * 1.8) * 0.07;
    robot.rotation.y += ((pointerX + Math.sin(elapsed * 0.8) * 0.12) - robot.rotation.y) * 0.12;
    robot.rotation.z = Math.sin(elapsed * 1.1) * 0.035;
    arm.rotation.z = -0.35 + Math.sin(elapsed * (open ? 5 : 2)) * (open ? 0.35 : 0.12);
    const blink = elapsed % 5 > 4.8 ? 0.025 : 0.16;
    eyes.forEach(eye => { eye.scale.y = blink; });
    renderer.render(scene, camera);
    if (storyRenderer) storyRenderer.render(scene, storyCamera);
  }
  requestAnimationFrame(animate);
} catch (error) {
  console.warn('Qbit is using its illustrated fallback:', error.message);
}



