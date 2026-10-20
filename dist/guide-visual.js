import * as THREE from './assets/three.module.min.js';
import { richMotionAllowed, watchMotionPreference } from './motion-policy.js';
export function startGuideVisual({guide, launcher, isPaused, isOpen}) {
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
  let last = 0, elapsed = 0, lost = false, frame = 0, storyVisible = false;
  if (storyCanvas) new IntersectionObserver(entries => { storyVisible = entries[0].isIntersecting; sync(); }).observe(storyCanvas);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lost = true; guide.classList.remove('has-3d');
  });
  function animate(time) {
    frame = 0;
    if (!allowed()) return;
    frame = requestAnimationFrame(animate);
    if (time - last < 40) return;
    elapsed += Math.min((time - last) / 1000, 0.05); last = time;
    robot.position.y = Math.sin(elapsed * 1.8) * 0.07;
    robot.rotation.y += ((pointerX + Math.sin(elapsed * 0.8) * 0.12) - robot.rotation.y) * 0.12;
    robot.rotation.z = Math.sin(elapsed * 1.1) * 0.035;
    arm.rotation.z = -0.35 + Math.sin(elapsed * (isOpen() ? 5 : 2)) * (isOpen() ? 0.35 : 0.12);
    const blink = elapsed % 5 > 4.8 ? 0.025 : 0.16;
    eyes.forEach(eye => { eye.scale.y = blink; });
    renderer.render(scene, camera);
    if (storyRenderer && storyVisible) storyRenderer.render(scene, storyCamera);
  }
  const allowed = () => !lost && !document.hidden && !isPaused() && richMotionAllowed() && (isOpen() || storyVisible);
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (allowed()) { last = performance.now(); frame = requestAnimationFrame(animate); }
  }
  launcher.addEventListener('click', sync);
  document.querySelector('#qbit-close').addEventListener('click', sync);
  document.querySelector('#qbit-motion').addEventListener('click', sync);
  document.querySelector('#story-motion')?.addEventListener('click', sync);
  guide.addEventListener('keydown', event => { if (event.key === 'Escape') sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('qixarc-motion', sync);
  watchMotionPreference(sync);
  sync();
} catch (error) {
  console.warn('Qbit is using its illustrated fallback:', error.message);
}
}
