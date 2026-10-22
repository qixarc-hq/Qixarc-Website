(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animate = (element, frames, options) => reduced.matches ? null : element.animate(frames, {easing: 'cubic-bezier(.22,1,.36,1)', ...options});
  let introSeen = false;
  try { introSeen = sessionStorage.getItem('qixarc-intro-v4') === 'seen'; } catch {}
  if (!introSeen && !reduced.matches) {
    const loader = document.createElement('div');
    loader.className = 'site-loader';
    loader.innerHTML = `<div class="orbital-light" aria-hidden="true"></div>
      <div class="loader-float float-build" aria-hidden="true"><b>⌘</b><span>Building<br><strong>something great.</strong></span><i></i></div>
      <div class="loader-float float-innovation" aria-hidden="true"><b>✦</b><span>Innovation<br><strong>in progress</strong></span></div>
      <div class="loader-float float-impact" aria-hidden="true"><b>↗</b><span>Next stop:<br><strong>greater impact</strong></span></div>
      <div class="loader-content"><div class="loader-universe" aria-hidden="true"><div class="loader-orbits"><i class="orbital-ring ring-one"><b></b></i><i class="orbital-ring ring-two"><b></b></i><i class="orbital-ring ring-three"><b></b></i></div><img class="loader-logo" src="/assets/qixarc-logo-opt.webp" alt="" width="200" height="202"></div>
      <p class="loader-title">Loading your experience to <strong>QIXARC</strong></p>
      <div class="loader-progress"><div class="loader-track" role="progressbar" aria-label="QIXARC introduction" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="loader-fill"></i></div><span class="loader-percent" aria-hidden="true">0%</span></div>
      <p class="loader-caption">Crafted with passion, refined in pixels</p></div><span class="loader-signature" aria-hidden="true">QIXARC<br>IDEAS IN MOTION</span>`;
    document.body.append(loader);
    animate(loader, [{opacity: 0}, {opacity: 1}], {duration: 160});
    const started = performance.now();
    let finished = false, frame = 0;
    const fill = loader.querySelector('.loader-fill');
    const track = loader.querySelector('.loader-track');
    const percent = loader.querySelector('.loader-percent');
    let previous = -1;
    const update = value => {
      if (value === previous) return;
      previous = value;
      fill.style.transform = `scaleX(${value / 100})`;
      track.setAttribute('aria-valuenow', String(value));
      percent.textContent = `${value}%`;
    };
    const finish = () => {
      if (finished) return;
      finished = true; cancelAnimationFrame(frame); clearTimeout(fallback);
      document.removeEventListener('keydown', finish);
      reduced.removeEventListener('change', finish);
      try { sessionStorage.setItem('qixarc-intro-v4', 'seen'); } catch {}
      update(100);
      const page = document.querySelector('main');
      if (page) animate(page, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 600 });
      const exit = animate(loader, [{ opacity: 1 }, { opacity: 0 }], { duration: 320 });
      if (exit) exit.finished.catch(() => {}).finally(() => loader.remove()); else loader.remove();
    };
    const tick = now => {
      const elapsed = now - started;
      update(Math.min(100, Math.floor(elapsed / 2000 * 100)));
      if (elapsed >= 2000 && document.readyState !== 'loading') finish(); else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const fallback = setTimeout(finish, 2800);
    reduced.addEventListener('change', finish, { once: true });
    document.addEventListener('keydown', finish, { once: true });
    const universe = loader.querySelector('.loader-universe');
    let pointerFrame = 0;
    loader.addEventListener('pointermove', event => {
      if (pointerFrame || event.pointerType !== 'mouse') return;
      const x = (event.clientX / innerWidth - .5) * 16;
      const y = (event.clientY / innerHeight - .5) * 12;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!finished) universe.style.transform = `translate(${x}px, ${y}px)`;
      });
    }, { passive: true });
    loader.addEventListener('pointerdown', () => animate(universe, [
      { scale: '1' }, { scale: '1.08', offset: .4 }, { scale: '1' }
    ], { duration: 400 }));
  }

})();
