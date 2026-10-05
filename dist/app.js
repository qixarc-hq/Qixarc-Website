(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  const menuBackground = [...document.querySelectorAll('main, footer, #qbit-guide, .nav-contact')];
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
    links.classList.remove('open');
    document.body.classList.remove('nav-open');
    menuBackground.forEach(element => { element.inert = false; });
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    links.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    menuBackground.forEach(element => { element.inert = open; });
    if (open) links.querySelector('a').focus();
  });
  links.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' && links.classList.contains('open')) {
      const items = [...links.querySelectorAll('a'), menu];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (event.key === 'Escape' && links.classList.contains('open')) {
      closeMenu();
      menu.focus();
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  const entranceAnimations = new Set();
  const finishEntrances = () => {
    entranceAnimations.forEach(animation => animation.finish());
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
    document.querySelectorAll('.motion-text').forEach(element => element.classList.add('text-visible'));
  };
  // Reference-inspired character reveals. Preserve words, line breaks and accessible names.
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const textObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('text-visible');
        textObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.hero h1, main h2, .project h3, .concept-copy h3').forEach(heading => {
      // Service headings are replaced when a visitor selects a tab.
      if (heading.id === 'service-title') return;
      const label = heading.cloneNode(true);
      label.querySelectorAll('[aria-hidden="true"]').forEach(element => element.remove());
      label.querySelectorAll('br').forEach(br => br.replaceWith(' '));
      heading.setAttribute('aria-label', heading.id === 'hero-title' ? 'Bold ideas made into digital impact.' : label.textContent.replace(/\s+/g, ' ').trim());
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT, {
        acceptNode: node => node.textContent.trim() && !node.parentElement.closest('[aria-hidden="true"]') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      let index = 0;
      nodes.forEach(node => {
        const run = document.createElement('span');
        run.className = 'motion-run';
        run.setAttribute('aria-hidden', 'true');
        node.textContent.split(/(\s+)/).forEach(word => {
          if (!word.trim()) { run.append(document.createTextNode(word)); return; }
          const wrapper = document.createElement('span');
          wrapper.className = 'motion-word';
          Array.from(word).forEach(character => {
            const letter = document.createElement('span');
            letter.className = 'motion-char';
            letter.textContent = character;
            letter.style.setProperty('--letter-delay', `${Math.min(index++ * 22, 480)}ms`);
            wrapper.append(letter);
          });
          run.append(wrapper);
        });
        node.replaceWith(run);
      });
      heading.classList.remove('reveal');
      heading.classList.add('motion-text');
      textObserver.observe(heading);
    });
  }
  // Animate individual hero lines without changing the layout or hiding content if JS fails.
  if (!reducedMotion.matches && 'animate' in Element.prototype) {
    const entranceSteps = [
      ['.nav', 70, -14],
      ['.hero-eyebrow', 150, 18],
      ['.hero-bottom', 480, 22],
      ['.showcase', 580, 28]
    ];
    entranceSteps.forEach(([selector, delay, distance]) => {
      document.querySelectorAll(selector).forEach(element => {
        const animation = element.animate([
          { opacity: 0, transform: `translateY(${distance}px)` },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 850, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
        entranceAnimations.add(animation);
        animation.onfinish = () => entranceAnimations.delete(animation);
      });
    });
  }
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    document.querySelectorAll('.stats > div, .process-grid article, .price-card, .about-brand, .about-copy, .service-tabs, .service-panel, .faq-list details, .section-heading > p, .contact-grid > div, #project-form .form-row > label, #project-form > fieldset, #project-form > label, #project-form > .button, #project-form > .form-help, .footer-top > *, .concept-card, .project-info > p, .project-info > .tags, .project-info > .button, .project-visual').forEach(element => element.classList.add('reveal'));
    document.querySelectorAll('#project-form .reveal').forEach((element, index) => {
      element.style.transitionDelay = `${index * 75}ms`;
    });
    document.querySelectorAll('.project').forEach(project => {
      project.querySelectorAll('.project-info > p, .project-info > .tags, .project-info > .button').forEach((element, index) => { element.style.transitionDelay = `${120 + index * 90}ms`; });
    });
    document.querySelectorAll('.stats, .process-grid, .pricing-grid').forEach(group => {
      [...group.children].forEach((element, index) => { element.style.transitionDelay = `${index * 80}ms`; });
    });
    document.body.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
  // Use a separate translate property so parallax and reveal/hover transforms coexist.
  const parallaxItems = [];
  [
    ['.inline-object, .image-pill', 0.07, '.hero'],
    ['.sculpture', 0.09, '.showcase'],
    ['.project-visual img, .work-cover', 0.08, '.project'],
    ['.asterisk, .swatches', -0.07, '.services'],
    ['.about-brand > div', 0.08, '.about'],
    ['.contact h2', 0.04, '.contact'],
    ['.footer-wordmark', 0.05, 'footer']
  ].forEach(([selector, speed, parent]) => {
    document.querySelectorAll(selector).forEach(element => {
      element.classList.add('parallax-layer');
      parallaxItems.push({ element, anchor: element.closest(parent), speed });
    });
  });
  const mobileMotion = window.matchMedia('(max-width: 760px)');
  function updateParallax() {
    const disabled = reducedMotion.matches || document.body.classList.contains('motion-paused');
    const viewport = window.innerHeight;
    const positions = new Map();
    parallaxItems.forEach(({ element, anchor, speed }) => {
      if (disabled) { element.style.removeProperty('translate'); return; }
      if (!positions.has(anchor)) positions.set(anchor, anchor.getBoundingClientRect());
      const rect = positions.get(anchor);
      if (rect.bottom < -100 || rect.top > viewport + 100) return;
      const strength = mobileMotion.matches ? 0.4 : 1;
      const offset = Math.max(-36, Math.min(36, (viewport / 2 - rect.top - rect.height / 2) * speed)) * strength;
      element.style.translate = `0 ${offset.toFixed(2)}px`;
    });
  }
  let scrollPending = false;
  const updateNavigation = () => {
    const normalize = path => path.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
    links.querySelectorAll('a').forEach(link => {
      if (normalize(link.pathname) === normalize(location.pathname) || (link.pathname === '/blog/' && location.pathname.startsWith('/blog/'))) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };
  const progress = document.querySelector('.scroll-progress');
  const updateProgress = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${total > 0 ? window.scrollY / total * 100 : 0}%`;
    updateParallax();
    updateNavigation();
    scrollPending = false;
  };
  const scheduleScrollUpdate = () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateProgress); }
  };
  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleScrollUpdate);
  window.addEventListener('load', scheduleScrollUpdate);
  window.addEventListener('qixarc-motion', scheduleScrollUpdate);
  updateProgress();
  const services = {
    design: { title: 'Thoughtful by design.', description: 'Intuitive interfaces and memorable digital experiences. We pair a clear visual identity with user journeys that make every interaction feel natural.', tags: ['Interface design', 'User experience', 'Prototyping'], glyph: 'Aa', color: 'linear-gradient(125deg,#008bea,#2445f5,#843cff)', label: 'CLARITY MEETS CHARACTER' },
    web: { title: 'Your ambition, engineered.', description: 'From a focused portfolio to a dynamic web application, we build responsive digital products with modern technology and the foundations to grow alongside your business.', tags: ['Responsive websites', 'Full-stack development', 'Performance'], glyph: '</>', color: 'linear-gradient(125deg,#080d36,#2636ce)', label: 'PRECISION IN EVERY PIXEL' },
    commerce: { title: 'Make your next sale simple.', description: 'Bring your products online with a complete store experience. We create clear product discovery and considered shopping journeys, shaped around your brand and customers.', tags: ['Online stores', 'Product catalogues', 'Shopping experiences'], glyph: 'e.', color: 'linear-gradient(125deg,#0054cc,#6330c5)', label: 'BUILT AROUND YOUR CUSTOMERS' },
    systems: { title: 'Smarter behind the scenes.', description: 'Custom digital systems that simplify your workflows. We connect thoughtful interfaces with scalable functionality, helping your team work efficiently and your business move forward.', tags: ['Dynamic applications', 'Custom workflows', 'Scalable systems'], glyph: '{ }', color: 'linear-gradient(125deg,#162bc2,#763bdd)', label: 'COMPLEXITY, MADE SIMPLE' }
  };
  const tabs = [...document.querySelectorAll('[data-service]')];
  const panel = document.querySelector('#service-panel');
  function selectService(tab) {
    const service = services[tab.dataset.service];
    tabs.forEach(button => {
      const selected = button === tab;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.querySelector('b').textContent = selected ? '−' : '＋';
    });
    panel.setAttribute('aria-labelledby', tab.id);
    document.querySelector('#service-title').textContent = service.title;
    document.querySelector('#service-description').textContent = service.description;
    document.querySelector('#service-tags').replaceChildren(...service.tags.map(tag => {
      const span = document.createElement('span'); span.textContent = tag; return span;
    }));
    document.querySelector('.service-monogram').textContent = service.glyph;
    document.querySelector('.service-graphic').style.background = service.color;
    document.querySelector('.graphic-label').textContent = service.label;
    if (!reducedMotion.matches) panel.animate([{ opacity: 0.5, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, easing: 'ease-out' });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectService(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); tabs[next].focus(); selectService(tabs[next]); }
    });
  });
  document.querySelectorAll('.faq-list details').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) document.querySelectorAll('.faq-list details').forEach(other => { if (other !== item) other.open = false; });
    });
  });
  document.querySelectorAll('[data-plan]').forEach(link => {
    link.addEventListener('click', () => {
      const input = [...document.querySelectorAll('input[name="service"]')].find(input => input.value === link.dataset.plan);
      if (input) input.checked = true;
    });
  });
  const form = document.querySelector('#project-form');
  const status = document.querySelector('#form-status');
  const copy = document.querySelector('#copy-enquiry');
  const setFormStatus = message => {
    const fragments = message.split('qixarc@gmail.com');
    status.replaceChildren();
    fragments.forEach((fragment, index) => {
      if (index) {
        const email = document.createElement('a');
        email.href = 'mailto:qixarc@gmail.com';
        email.textContent = 'qixarc@gmail.com';
        email.style.textDecoration = 'underline';
        status.append(email);
      }
      status.append(document.createTextNode(fragment));
    });
  };
  const animateFormFeedback = (element, keyframes, duration = 350) => {
    if (reducedMotion.matches || document.body.classList.contains('motion-paused') || !element.animate) return;
    const animation = element.animate(keyframes, { duration, easing: 'cubic-bezier(.22,1,.36,1)' });
    entranceAnimations.add(animation);
    animation.onfinish = () => entranceAnimations.delete(animation);
    animation.oncancel = () => entranceAnimations.delete(animation);
  };
  form?.addEventListener('change', event => {
    if (!event.target.matches('input[type="radio"]')) return;
    animateFormFeedback(event.target.nextElementSibling, [
      { transform: 'scale(1)' }, { transform: 'scale(1.07)', offset: 0.4 }, { transform: 'scale(1)' }
    ]);
  });
  form?.addEventListener('invalid', event => {
    animateFormFeedback(event.target, [
      { transform: 'translateX(0)' }, { transform: 'translateX(-4px)' },
      { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }
    ], 280);
  }, true);
  if (status) new MutationObserver(() => {
    if (!status.textContent) return;
    animateFormFeedback(status, [
      { opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }
    ], 420);
  }).observe(status, { childList: true, characterData: true, subtree: true });
  let submissionId = null;
  const submitButton = form?.querySelector('[type="submit"]');
  if (form) {
    submitButton.textContent = 'Send project enquiry →';
    const help = form.querySelector('.form-help');
    if (help) help.textContent = 'Your details are sent securely to the QIXARC team.';
    if (copy) copy.hidden = true;
    const trap = document.createElement('input');
    trap.name = 'company_website'; trap.tabIndex = -1; trap.autocomplete = 'off';
    trap.className = 'form-trap'; trap.setAttribute('aria-hidden', 'true'); form.append(trap);
  }
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || submitButton.disabled) return;
    const data = new FormData(form);
    if (data.get('company_website')) { setFormStatus('Unable to submit this enquiry.'); return; }
    if (!window.qixarcDB) { setFormStatus('Connection unavailable. Please retry or email qixarc@gmail.com.'); return; }
    submissionId ||= crypto.randomUUID();
    submitButton.disabled = true; submitButton.textContent = 'Sending…';
    setFormStatus('Sending your enquiry…');
    try {
      const { error } = await window.qixarcDB.from('qixarc_enquiries').insert({
        id: submissionId,
        name: String(data.get('name')).trim(), email: String(data.get('email')).trim(),
        service: String(data.get('service') || 'A new digital project'), message: String(data.get('message')).trim()
      });
      if (error && error.code !== '23505') throw error;
      form.reset(); submissionId = null;
      setFormStatus('Thank you. Your enquiry has been received by QIXARC.');
    } catch { setFormStatus('Your enquiry could not be confirmed. Please retry or email qixarc@gmail.com. Your details are still in the form.'); }
    finally { submitButton.disabled = false; submitButton.textContent = 'Send project enquiry →'; }
  });
  const motionToggle = document.querySelector('#motion-toggle');
  let paused = reducedMotion.matches;
  function setMotion(value) {
    paused = value;
    if (paused) finishEntrances();
    document.body.classList.toggle('motion-paused', paused);
    motionToggle?.setAttribute('aria-pressed', String(paused));
    if (motionToggle) motionToggle.textContent = paused ? 'Resume motion ▷' : 'Pause motion Ⅱ';
    window.dispatchEvent(new CustomEvent('qixarc-motion', { detail: { paused } }));
  }
  motionToggle?.addEventListener('click', () => setMotion(!paused));
  reducedMotion.addEventListener('change', event => setMotion(event.matches));
  setMotion(paused);
  document.querySelector('#year').textContent = new Date().getFullYear();
})();

