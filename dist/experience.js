(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const animate = (element, frames, options) => reduced.matches ? null : element.animate(frames, { duration: 350, easing: ease, ...options });
  document.querySelectorAll('.section-label').forEach(label => {
    const match = label.textContent.trim().match(/^\/?(\d+(?:\.\d+)?)\s*(?:\/|—)\s*(.+)$/);
    if (!match || label.children.length) return;
    const number = document.createElement('span'); number.className = 'section-number'; number.textContent = match[1] + ' /';
    const text = document.createElement('span'); text.className = 'section-label-text'; text.textContent = match[2];
    label.replaceChildren(number, text);
  });

  let introSeen = false;
  try { introSeen = sessionStorage.getItem('qixarc-intro-v3') === 'seen'; } catch {}
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
      try { sessionStorage.setItem('qixarc-intro-v3', 'seen'); } catch {}
      update(100);
      const exit = animate(loader, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 });
      if (exit) exit.finished.catch(() => {}).finally(() => loader.remove()); else loader.remove();
    };
    const tick = now => {
      const elapsed = now - started;
      update(Math.min(100, Math.floor(elapsed / 2000 * 100)));
      if (elapsed >= 2000) finish(); else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const fallback = setTimeout(finish, 2500);
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

  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const cards = document.querySelectorAll('.interactive-card,.home-product-card,.team-profile,.detail-card,.cms-card,.catalogue-product,.journal-card');
  cards.forEach(card => {
    card.classList.add('motion-card');
    let pending = false, x = 0, y = 0;
    const reset = () => { card.style.removeProperty('--card-rx'); card.style.removeProperty('--card-ry'); };
    card.addEventListener('pointermove', event => {
      if (reduced.matches || !hover.matches) return;
      const rect = card.getBoundingClientRect();
      x = (event.clientX - rect.left) / rect.width - .5;
      y = (event.clientY - rect.top) / rect.height - .5;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        card.style.setProperty('--card-rx', `${(-y * 4).toFixed(2)}deg`);
        card.style.setProperty('--card-ry', `${(x * 4).toFixed(2)}deg`);
      });
    });
    card.addEventListener('pointerleave', reset);
    reduced.addEventListener('change', reset);
  });
  if ('IntersectionObserver' in window && !reduced.matches) {
    const entrances = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animate(entry.target, [{ opacity: 0, transform: 'translateY(22px) scale(.975)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 560 });
      entrances.unobserve(entry.target);
    }), { threshold: .12 });
    document.querySelectorAll('.capability-card,.value-card,.page-art,.studio-card,.home-product-card,.team-profile,.detail-card,.cms-card').forEach(card => entrances.observe(card));
  }

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      document.querySelectorAll('.nav-links a.is-selected').forEach(item => item.classList.remove('is-selected'));
      link.classList.add('is-selected');
    });
  });
  document.querySelectorAll('.wordmark').forEach(brand => brand.addEventListener('click', event => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const home = new URL(brand.href, location.href);
    const logo = brand.querySelector('img');
    const goHome = () => {
      if (location.pathname === '/') window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
      else location.assign(home.href);
    };
    const motion = logo && animate(logo, [
      { transform: 'translateX(0) rotate(0) scale(1)' },
      { transform: 'translateX(-18px) rotate(-24deg) scale(.86)', offset: .45 },
      { transform: 'translateX(0) rotate(0) scale(1)' }
    ], { duration: 360 });
    if (motion) motion.finished.then(goHome).catch(goHome); else goHome();
  }));

  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      hero.classList.toggle('ambient-paused', !entries[0].isIntersecting);
    });
    visibility.observe(hero);
  }

  const faqs = [...document.querySelectorAll('.faq-list details')];
  faqs.forEach(details => {
    const summary = details.querySelector('summary');
    const answer = document.createElement('div'); answer.className = 'faq-answer';
    [...details.children].filter(child => child !== summary).forEach(child => answer.append(child));
    details.append(answer);
    details.open = false;
    let motion;
    const setOpen = value => {
      const start = details.getBoundingClientRect().height;
      motion?.cancel();
      details.style.height = ''; details.style.overflow = '';
      if (reduced.matches) { details.open = value; return; }
      if (value) details.open = true;
      const padding = parseFloat(getComputedStyle(details).paddingTop) + parseFloat(getComputedStyle(details).paddingBottom);
      const border = parseFloat(getComputedStyle(details).borderTopWidth) + parseFloat(getComputedStyle(details).borderBottomWidth);
      const end = value ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + padding + border;
      details.style.overflow = 'hidden'; details.dataset.animating = 'true';
      details.dataset.closing = String(!value);
      motion = details.animate([{ height: `${start}px` }, { height: `${end}px` }], { duration: 360, easing: ease });
      animate(answer, value ? [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'translateY(0)' }] : [{ opacity: 1 }, { opacity: 0 }], { duration: 220 });
      motion.onfinish = () => {
        details.open = value; details.style.overflow = ''; delete details.dataset.animating; delete details.dataset.closing; motion = null;
      };
    };
    details.qixarcOpen = setOpen;
    summary.addEventListener('click', event => {
      event.preventDefault(); details.dataset.userControlled = 'true';
      setOpen(details.dataset.closing === 'true' || !details.open);
    });
    reduced.addEventListener('change', () => {
      if (!reduced.matches || !motion) return;
      const value = details.dataset.closing !== 'true'; motion.cancel(); motion = null;
      details.open = value; details.style.overflow = ''; delete details.dataset.animating; delete details.dataset.closing;
    });
  });
  if (faqs.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const details = entry.target;
      observer.unobserve(details);
      if (!details.open && !details.dataset.userControlled) details.qixarcOpen(true);
    }), { threshold: .65, rootMargin: '-15% 0px -20% 0px' });
    observer.observe(faqs[0]);
  }
})();
