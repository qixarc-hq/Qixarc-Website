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

  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  // A bounded pool avoids allocating a new node for every pointer event.
  const trail = document.createElement('div'); trail.className = 'cursor-stars'; trail.setAttribute('aria-hidden', 'true');
  const sparks = Array.from({length: 8}, () => { const star = document.createElement('i'); trail.append(star); return star; });
  document.body.append(trail);
  let lastSpark = 0, lastX = 0, lastY = 0, sparkIndex = 0;
  const clearTrail = () => sparks.forEach(star => star.getAnimations().forEach(motion => motion.cancel()));
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !hover.matches || reduced.matches || document.hidden || navigator.connection?.saveData || document.body.classList.contains('nav-open') || event.target.closest('input,textarea,select')) return;
    const now = performance.now();
    if (now - lastSpark < 70 || Math.hypot(event.clientX-lastX,event.clientY-lastY) < 12) return;
    lastSpark = now; lastX = event.clientX; lastY = event.clientY;
    const star = sparks[sparkIndex++ % sparks.length];
    star.getAnimations().forEach(motion => motion.cancel());
    star.style.left = `${event.clientX}px`; star.style.top = `${event.clientY}px`;
    star.animate([{opacity:.7, transform:'translate(-50%,-50%) scale(.8) rotate(0deg)'}, {opacity:0, transform:'translate(-50%,14px) scale(.15) rotate(50deg)'}], {duration:420,easing:'ease-out'});
  }, {passive:true});
  reduced.addEventListener('change', clearTrail); hover.addEventListener('change', clearTrail); document.addEventListener('visibilitychange', clearTrail);
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
      { transform: 'translateX(-3px) scale(.97)', offset: .45 },
      { transform: 'translateX(0) rotate(0) scale(1)' }
    ], { duration: 180 });
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
    }), { threshold: .4, rootMargin: '0px 0px -10% 0px' });
    observer.observe(faqs[0]);
  }
})();
