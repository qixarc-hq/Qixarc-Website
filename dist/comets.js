(() => {
  document.querySelectorAll('.hero,.detail-hero,#intro,#about').forEach(host => {
  host.classList.add('comet-host');
  let field = host.querySelector(':scope > .intro-comets');
  if (!field) { field = document.createElement('div'); field.className = 'intro-comets'; field.setAttribute('aria-hidden', 'true'); host.prepend(field); }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const random = (min, max) => min + Math.random() * (max - min);
  let visible = false, frame = 0, previous = 0, width = 1, height = 1;
  let particles = [];
  const rebuild = () => {
    field.replaceChildren();
    particles = Array.from({ length: mobile.matches ? 3 : 7 }, (_, index) => {
      const element = document.createElement('span');
      element.className = 'intro-comet';
      field.append(element);
      return { element, active: false, wait: random(0, 120) + index * (mobile.matches ? 160 : 110), time: 0 };
    });
  };
  const launch = particle => {
    const angle = random(16, 32);
    const radians = angle * Math.PI / 180;
    const distance = random(.5, .95) * Math.hypot(width, height);
    Object.assign(particle, {
      active: true, time: 0, duration: random(380, 700),
      x: random(-.25, .45) * width, y: random(-.2, .4) * height,
      dx: Math.cos(radians) * distance, dy: Math.sin(radians) * distance,
      angle, peak: random(.35, .7)
    });
    particle.element.style.width = `${random(mobile.matches ? 45 : 80, mobile.matches ? 110 : 180)}px`;
    particle.element.style.height = `${random(.8, 1.7)}px`;
  };
  const allowed = () => visible && !document.hidden && !reduced.matches && !navigator.connection?.saveData && !document.body.classList.contains('motion-paused');
  const tick = now => {
    frame = 0;
    if (!allowed()) return;
    const delta = Math.min(now - previous, 64);
    previous = now;
    for (const particle of particles) {
      if (!particle.active) {
        particle.wait -= delta;
        if (particle.wait <= 0) launch(particle);
        continue;
      }
      particle.time += delta / particle.duration;
      if (particle.time >= 1) {
        particle.active = false;
        particle.element.style.opacity = '0';
        particle.wait = mobile.matches ? random(80, 260) : random(100, 500);
        continue;
      }
      const progress = 1 - (1 - particle.time) ** 2;
      const fade = particle.time < .18 ? particle.time / .18 : 1 - (particle.time - .18) / .82;
      particle.element.style.transform = `translate3d(${particle.x + particle.dx * progress}px,${particle.y + particle.dy * progress}px,0) rotate(${particle.angle}deg)`;
      particle.element.style.opacity = String(Math.max(0, fade) * particle.peak);
    }
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    field.hidden = reduced.matches;
    if (allowed()) { previous = performance.now(); frame = requestAnimationFrame(tick); }
  };
  rebuild();
  new ResizeObserver(() => { width = field.clientWidth; height = field.clientHeight; }).observe(field);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(field.parentElement);
  reduced.addEventListener('change', sync);
  mobile.addEventListener('change', () => { rebuild(); sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('qixarc-motion', sync);
  });
})();
