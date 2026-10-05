import * as THREE from './assets/three.module.min.js';
import logoShapes from './assets/logo-shapes.js?v=smooth-2';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches || document.body.classList.contains('motion-paused');
const scenes = [];
const pointer = { x: 0, y: 0 };
window.addEventListener('qixarc-motion', event => { paused = event.detail.paused; renderOnce(); });
function studioEnvironment(renderer) {
  const room = new THREE.Scene();
  room.background = new THREE.Color('#778397');
  const shell = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: 0x8f9daf, side: THREE.BackSide }));
  room.add(shell);
  [[-4, 4, 2, 9, 3], [4, 2, -2, 6, 5], [0, -4, 3, 7, 2]].forEach(([x, y, z, width, height]) => {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 4, 4), side: THREE.DoubleSide }));
    panel.position.set(x, y, z); panel.lookAt(0, 0, 0); room.add(panel);
  });
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromScene(room, 0.03);
  generator.dispose();
  room.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); });
  return target;
}
function createScene(canvas, small) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  const environment = studioEnvironment(renderer);
  scene.environment = environment.texture;
  const camera = new THREE.PerspectiveCamera(small ? 40 : 36, 1, 0.1, 40);
  camera.position.set(0, 0, small ? 6 : 7.9);
  const group = new THREE.Group();
  scene.add(group);
  if (small) group.scale.setScalar(0.95);
  {
    // Smooth silhouette with a physically lit finish, rather than baked image highlights.
    const paths = logoShapes.map(part => {
      const shape = new THREE.Shape(part.outline.map(([x, y]) => new THREE.Vector2(x, y)));
      part.holes.forEach(hole => shape.holes.push(new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(x, y)))));
      return shape;
    });
    const geometry = new THREE.ExtrudeGeometry(paths, {
      depth: 0.14, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025,
      bevelSegments: 4, steps: 1,
      UVGenerator: {
        generateTopUV: (geometry, vertices, a, b, c) => [a, b, c].map(index => new THREE.Vector2(vertices[index * 3] / 3.7 + 0.5, vertices[index * 3 + 1] / 3.7 + 0.5)),
        generateSideWallUV: () => [new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)]
      }
    });
    geometry.translate(0, 0, -0.07);
    const positions = geometry.getAttribute('position');
    const colors = [];
    const cobalt = new THREE.Color('#1239db'), cyan = new THREE.Color('#008fdf'), violet = new THREE.Color('#703de0');
    for (let i = 0; i < positions.count; i++) {
      const blend = THREE.MathUtils.clamp((positions.getX(i) + positions.getY(i) + 2.4) / 4.8, 0, 1);
      const color = blend < 0.5 ? cyan.clone().lerp(cobalt, blend * 2) : cobalt.clone().lerp(violet, (blend - 0.5) * 2);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const face = new THREE.MeshPhysicalMaterial({ vertexColors: true, metalness: 0.48, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.22, envMapIntensity: 0.8 });
    const edge = new THREE.MeshPhysicalMaterial({ color: 0x2248c4, metalness: 0.65, roughness: 0.26, clearcoat: 0.7, envMapIntensity: 0.9 });
    const logo = new THREE.Mesh(geometry, [face, edge]);
    group.add(logo);
    // Restore the original brand artwork while filtering out its fine surface grain.
    // Keep the smoothed geometry and bounded rotation from the previous revision.
    new THREE.TextureLoader().load('./assets/qixarc-logo.webp', texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      const brandedFace = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
      brandedFace.onBeforeCompile = shader => {
        shader.uniforms.logoTexel = { value: new THREE.Vector2(1.8 / texture.image.width, 1.8 / texture.image.height) };
        shader.fragmentShader = 'uniform vec2 logoTexel;\n' + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
          #ifdef USE_MAP
            vec4 smoothColor = texture2D(map, vMapUv) * 4.0;
            smoothColor += texture2D(map, vMapUv + vec2(logoTexel.x, 0.0)) * 2.0;
            smoothColor += texture2D(map, vMapUv - vec2(logoTexel.x, 0.0)) * 2.0;
            smoothColor += texture2D(map, vMapUv + vec2(0.0, logoTexel.y)) * 2.0;
            smoothColor += texture2D(map, vMapUv - vec2(0.0, logoTexel.y)) * 2.0;
            smoothColor += texture2D(map, vMapUv + logoTexel);
            smoothColor += texture2D(map, vMapUv - logoTexel);
            smoothColor += texture2D(map, vMapUv + vec2(logoTexel.x, -logoTexel.y));
            smoothColor += texture2D(map, vMapUv + vec2(-logoTexel.x, logoTexel.y));
            diffuseColor.rgb *= smoothColor.rgb / 16.0;
          #endif
        `);
      };
      brandedFace.customProgramCacheKey = () => 'qixarc-smooth-original-v1';
      logo.material[0] = brandedFace;
      face.dispose();
      renderer.render(scene, camera);
    }, undefined, () => { console.warn('Original logo color unavailable; using the smooth brand material.'); });

  }
  scene.add(new THREE.HemisphereLight(0xffffff, 0x172554, 2.4));
  const light = new THREE.DirectionalLight(0xffffff, 4); light.position.set(-3, 5, 5); scene.add(light);
  const rim = new THREE.DirectionalLight(0x843cff, 3); rim.position.set(4, -2, -3); scene.add(rim);
  const data = { renderer, scene, camera, group, small, visible: true, elapsed: 0 };
  scenes.push(data);
  const resize = () => {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (width < 1 || height < 1) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = small ? 6 : (camera.aspect < 0.9 ? 10 : 7.9);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => { data.visible = entries[0].isIntersecting; if (data.visible) renderer.render(scene, camera); }, { rootMargin: '100px' }).observe(canvas);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); data.visible = false; canvas.style.display = 'none'; const fallback = canvas.parentElement.querySelector('[aria-hidden], .orbit-fallback'); if (fallback) fallback.style.display = ''; });
  resize();
  const fallback = canvas.parentElement.querySelector(small ? '.orbit-fallback' : '.sculpture-fallback');
  if (fallback) fallback.style.display = 'none';
}
const sculpture = document.querySelector('#sculpture');
sculpture.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;
  const box = sculpture.getBoundingClientRect();
  pointer.x = ((event.clientX - box.left) / box.width - 0.5) * 0.8;
  pointer.y = ((event.clientY - box.top) / box.height - 0.5) * 0.5;
});
sculpture.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
function renderOnce() { for (const item of scenes) if (item.visible) item.renderer.render(item.scene, item.camera); }
try { createScene(document.querySelector('#brand-canvas'), false); } catch (error) { document.querySelector('#motion-hint').textContent = 'CRAFTED WITH PASSION. REFINED IN PIXELS.'; console.warn('3D fallback active:', error.message); }
try { createScene(document.querySelector('#hero-orbit'), true); } catch (error) { console.warn('Hero fallback active:', error.message); }
let previous = 0;
function animate(time) {
  requestAnimationFrame(animate);
  if (document.hidden || paused) { previous = time; return; }
  if (time - previous < 30) return;
  const delta = Math.min((time - previous) / 1000, 0.05);
  previous = time;
  scenes.forEach(item => {
    if (!item.visible) return;
    item.elapsed += delta;
    const yaw = Math.sin(item.elapsed * (item.small ? 0.6 : 0.42)) * 0.18 + (item.small ? 0 : pointer.x * 0.4);
    const pitch = Math.sin(item.elapsed * 0.32) * 0.06 + (item.small ? 0 : pointer.y * 0.35);
    const smoothing = 1 - Math.exp(-4 * delta);
    item.group.rotation.y += (yaw - item.group.rotation.y) * smoothing;
    item.group.rotation.x += (pitch - item.group.rotation.x) * smoothing;
    item.group.rotation.z = Math.sin(item.elapsed * 0.35) * 0.025;
    item.group.position.y = Math.sin(item.elapsed * 0.8) * (item.small ? 0.03 : 0.065);
    item.renderer.render(item.scene, item.camera);
  });
}
requestAnimationFrame(animate);

