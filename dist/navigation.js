(() => {
  const header = document.querySelector('header#top');
  const measure = () => document.documentElement.style.setProperty('--nav-height', `${header.getBoundingClientRect().height}px`);
  new ResizeObserver(measure).observe(header);
  measure();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const routes = ['home', 'story', 'products', 'services', 'about', 'research', 'blog', 'contact', 'blog/motion-with-purpose', 'blog/post'];
  const pathKey = path => path.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
  const curtain = document.createElement('div');
  curtain.className = 'page-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<small></small><strong></strong><i></i>';
  document.body.append(curtain);
  const label = pathname => {
    const name = pathKey(pathname).split('/').filter(Boolean)[0] || 'home';
    curtain.querySelector('small').textContent = `/${String(routes.indexOf(name) + 1).padStart(2, '0')}`;
    curtain.querySelector('strong').textContent = name === 'research' ? 'R&D' : name;
  };
  const options = { duration: 800, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' };
  let busy = false;
  const reset = () => {
    busy = false;
    curtain.getAnimations().forEach(animation => animation.cancel());
    curtain.classList.remove('is-active');
  };
  let incoming;
  try { incoming = JSON.parse(sessionStorage.getItem('qixarc-transition')); sessionStorage.removeItem('qixarc-transition'); } catch {}
  if (incoming && incoming.path === location.pathname && Date.now() - incoming.time < 15000 && !reduced.matches) {
    label(location.pathname);
    curtain.classList.add('is-active');
    curtain.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], options).finished.then(reset);
  }
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    reset();
    if (!reduced.matches && !document.body.classList.contains('motion-paused')) {
      document.querySelector('main').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320 });
    }
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || pathKey(target.pathname) === pathKey(location.pathname) || !routes.includes(pathKey(target.pathname).slice(1) || 'home')) return;
    if (reduced.matches || document.body.classList.contains('motion-paused')) return;
    event.preventDefault();
    if (busy) return;
    busy = true;
    label(target.pathname);
    curtain.classList.add('is-active');
    curtain.querySelector('strong').animate([{ transform: 'translateY(108%)' }, { transform: 'translateY(0)' }], { duration: 720, delay: 80, easing: 'cubic-bezier(.16,1,.3,1)' });
    curtain.querySelector('i').animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 650, delay: 150, easing: 'cubic-bezier(.16,1,.3,1)' });
    curtain.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], options).finished.then(() => {
      try { sessionStorage.setItem('qixarc-transition', JSON.stringify({ path: target.pathname, time: Date.now() })); } catch {}
      location.assign(target.href);
    });
    // Recover if the browser cancels or blocks navigation.
    setTimeout(reset, 5000);
  });
})();
