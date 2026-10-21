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
  try { introSeen = sessionStorage.getItem('qixarc-intro') === 'seen'; } catch {}
  if (!introSeen && !reduced.matches) {
    const loader = document.createElement('div');
    loader.className = 'site-loader';
    loader.innerHTML = '<div class="loader-content"><img class="loader-logo" src="/assets/logo-nav-opt.webp" alt="" width="80" height="80"><span class="loader-wordmark">QIXARC</span><div class="loader-track" role="progressbar" aria-label="Preparing QIXARC" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="loader-fill"></i></div><div class="loader-caption"><span>IDEAS INTO EXPERIENCES</span><span class="loader-percent">0%</span></div></div>';
    document.body.append(loader);
    let finished = false, completed = 1;
    const update = value => {
      loader.querySelector('.loader-fill').style.transform = `scaleX(${value / 100})`;
      loader.querySelector('.loader-track').setAttribute('aria-valuenow', String(value));
      loader.querySelector('.loader-percent').textContent = `${value}%`;
    };
    const finish = () => {
      if (finished) return;
      finished = true; clearTimeout(limit);
      try { sessionStorage.setItem('qixarc-intro', 'seen'); } catch {}
      update(100);
      const exit = animate(loader, [{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 120 });
      if (exit) exit.finished.catch(() => {}).finally(() => loader.remove()); else loader.remove();
    };
    const limit = setTimeout(finish, 1600);
    const tasks = [document.fonts.ready, loader.querySelector('img').decode().catch(() => {})];
    const heroImage = document.querySelector('.hero img:not([loading="lazy"])');
    if (heroImage) tasks.push(heroImage.decode().catch(() => {}));
    update(Math.round(100 / (tasks.length + 1)));
    tasks.forEach(task => Promise.resolve(task).finally(() => {
      if (finished) return;
      completed++; update(Math.round(completed / (tasks.length + 1) * 100));
      if (completed === tasks.length + 1) finish();
    }));
    reduced.addEventListener('change', finish, { once: true });
    document.addEventListener('keydown', finish, { once: true });
  }

  document.querySelectorAll('.wordmark').forEach(brand => brand.addEventListener('click', event => {
    if (event.button === 0 && location.pathname === '/' && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}); }
    const logo = brand.querySelector('img');
    if (logo) animate(logo, [{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(.82) rotate(-16deg)', offset: .45 }, { transform: 'scale(1) rotate(0)' }], { duration: 330 });
  }));

  const faqs = [...document.querySelectorAll('.faq-list details')];
  faqs.forEach(details => {
    const summary = details.querySelector('summary');
    const answer = document.createElement('div'); answer.className = 'faq-answer';
    [...details.children].filter(child => child !== summary).forEach(child => answer.append(child));
    details.append(answer);
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
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const details = entry.target;
      observer.unobserve(details);
      if (!details.open && !details.dataset.userControlled) details.qixarcOpen(true);
    }), { threshold: .65, rootMargin: '-15% 0px -20% 0px' });
    faqs.forEach(details => observer.observe(details));
  }
})();
