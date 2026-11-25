(() => {
  const company = window.QixarcCompany;
  const cache = window.QixarcPublicContent;
  const animations = new WeakMap();
  const staticCards = matchMedia('(hover: none), (max-width: 767px)');
  const canHover = matchMedia('(hover: hover) and (pointer: fine), (any-hover: hover) and (any-pointer: fine)');
  let openCard, openBy, hoverTimer, hoverCard, mouseOverCard, lastPointerType;
  let restoringFocus = false;

  function portfolioUrl(value) {
    const href = company.webUrl(value);
    return /^https?:\/\//.test(href) ? href : '';
  }

  function setFace(face, visible) {
    face.inert = !visible;
    face.setAttribute('aria-hidden', String(!visible));
    const link = face.querySelector('[data-team-portfolio]');
    if (link) link.tabIndex = visible && !link.hidden ? 0 : -1;
  }

  function setFlip(card, flipped) {
    const trigger = card.querySelector('.team-card-toggle');
    const front = card.querySelector('.team-card-front');
    const back = card.querySelector('.team-card-back');
    clearTimeout(animations.get(card));
    setFace(front, false);
    setFace(back, false);
    trigger.setAttribute('aria-pressed', String(flipped));
    card.classList.toggle('is-flipped', flipped);
    card.setAttribute('data-turning', '');
    const grid = card.closest('[data-team-grid]');
    const duration = Number.parseFloat(getComputedStyle(grid).getPropertyValue('--team-flip-duration'));
    animations.set(card, setTimeout(() => {
      card.removeAttribute('data-turning');
      setFace(front, !flipped);
      setFace(back, flipped);
      grid.dispatchEvent(new Event('team-flip-settled'));
    }, duration));
  }

  function clearHover() {
    clearTimeout(hoverTimer);
    hoverCard = null;
  }

  function focusCard(card) {
    const target = card.querySelector(staticCards.matches ? '[data-team-portfolio]:not([hidden])' : '.team-card-toggle');
    restoringFocus = true;
    target?.focus({ preventScroll: true });
    restoringFocus = false;
  }

  function show(card, source) {
    clearHover();
    if (staticCards.matches || openCard === card) return;
    const previous = openCard;
    openCard = card;
    openBy = source;
    if (previous) {
      if (previous.querySelector('.team-card-back').contains(document.activeElement)) focusCard(previous);
      setFlip(previous, false);
    }
    if (openCard) setFlip(openCard, true);
  }

  function mount(grid) {
    const initial = [...grid.querySelectorAll('[data-team-id]')];
    if (!initial.length) return () => {};
    const template = initial[0].cloneNode(true);
    const cards = new Map(initial.map(card => [card.dataset.teamId, card]));
    const fallbackPhotos = new Map(initial.map(card => [
      card.dataset.teamId, card.querySelector('[data-team-photo]').getAttribute('src')
    ]));
    const mobileSources = new Map(initial.map(card => [
      fallbackPhotos.get(card.dataset.teamId), card.querySelector('[data-team-mobile-photo]').getAttribute('srcset')
    ]));
    const portraitOwners = new Map([...fallbackPhotos].filter(([,photo]) => photo).map(([id,photo]) => [photo,id]));
    let order = initial;

    function configureMode(card) {
      const trigger = card.querySelector('.team-card-toggle');
      const frontLink = card.querySelector('[data-team-front-link]');
      const front = card.querySelector('.team-card-front');
      const back = card.querySelector('.team-card-back');
      const portfolio = back.querySelector('[data-team-portfolio]');
      clearTimeout(animations.get(card));
      card.classList.remove('is-flipped');
      card.removeAttribute('data-turning');
      card.removeAttribute('data-mouse-over');
      trigger.hidden = staticCards.matches;

      if (staticCards.matches) {
        trigger.removeAttribute('aria-pressed');
        for (const element of [front, back, frontLink, portfolio]) {
          element.removeAttribute('aria-hidden');
          element.removeAttribute('inert');
          element.removeAttribute('tabindex');
        }
      } else {
        trigger.setAttribute('aria-pressed', 'false');
        frontLink.inert = true;
        frontLink.tabIndex = -1;
        setFace(front, true);
        setFace(back, false);
      }
    }

    function bind(card) {
      const photo = card.querySelector('[data-team-photo]');
      const mobilePhoto = card.querySelector('[data-team-mobile-photo]');
      const placeholder = card.querySelector('.team-card-initials');
      card.setAttribute('data-team-ready', '');
      configureMode(card);
      const showPhoto = () => { photo.hidden = false; placeholder.hidden = true; };
      const showPlaceholder = () => {
        if (staticCards.matches && mobilePhoto.hasAttribute('srcset')) {
          mobilePhoto.removeAttribute('srcset');
          return;
        }
        photo.hidden = true;
        placeholder.hidden = false;
        cache.report('Team portrait could not be loaded', new Error('image unavailable'));
      };
      photo.addEventListener('load', showPhoto);
      photo.addEventListener('error', showPlaceholder);
      if (photo.hasAttribute('src') && photo.complete && !photo.naturalWidth) showPlaceholder();

      const beginHover = event => {
        if (staticCards.matches || event.pointerType !== 'mouse' || !canHover.matches || mouseOverCard === card) return;
        mouseOverCard = card;
        card.setAttribute('data-mouse-over', '');
        if (openCard === card) return;
        clearHover();
        hoverCard = card;
        hoverTimer = setTimeout(() => show(card, 'mouse'), 80);
      };
      card.addEventListener('pointerenter', beginHover);
      card.addEventListener('pointermove', beginHover);
      card.addEventListener('pointerleave', event => {
        if (event.pointerType !== 'mouse') return;
        if (mouseOverCard === card) mouseOverCard = null;
        card.removeAttribute('data-mouse-over');
        if (openCard === card && openBy === 'mouse') show(null);
        else if (hoverCard === card) clearHover();
      });
    }

    function update(card, person, occupiedPhotos) {
      const photo = card.querySelector('[data-team-photo]');
      const mobilePhoto = card.querySelector('[data-team-mobile-photo]');
      const placeholder = card.querySelector('.team-card-initials');
      photo.style.objectPosition = company.photoFocus(person.photoFocus) || '';
      for (const name of card.querySelectorAll('[data-team-name]')) name.textContent = person.name;
      for (const role of card.querySelectorAll('[data-team-role]')) role.textContent = person.role;
      card.querySelector('.team-card-toggle').setAttribute('aria-label', 'Flip card for ' + person.name);
      placeholder.textContent = person.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();

      const href = portfolioUrl(person.portfolio);
      for (const link of card.querySelectorAll('[data-team-front-link], [data-team-portfolio]')) {
        if (href) link.href = href;
        else link.removeAttribute('href');
        link.setAttribute('aria-label', 'Open ' + person.name + '’s portfolio in a new tab');
      }
      const back = card.querySelector('.team-card-back');
      const link = back.querySelector('[data-team-portfolio]');
      const linkWasFocused = link === document.activeElement;
      link.hidden = !href;
      if (!staticCards.matches) link.tabIndex = href && !back.inert ? 0 : -1;
      if (!href && linkWasFocused) focusCard(card);

      const candidate = company.photoUrl(person.photo);
      const ownFallback = fallbackPhotos.get(person.id);
      const belongsToAnother = candidate && portraitOwners.has(candidate) && portraitOwners.get(candidate) !== person.id;
      const duplicatesAnother = candidate && ownFallback && candidate !== ownFallback && occupiedPhotos.has(candidate);
      const src = belongsToAnother || duplicatesAnother ? ownFallback : candidate;
      if (src && photo.getAttribute('src') !== src) {
        placeholder.hidden = false;
        photo.hidden = false;
        photo.src = src;
        const srcset = mobileSources.get(src);
        if (srcset) mobilePhoto.setAttribute('srcset', srcset);
        else mobilePhoto.removeAttribute('srcset');
      } else if (!src) {
        mobilePhoto.removeAttribute('srcset');
        photo.removeAttribute('src');
        photo.hidden = true;
        placeholder.hidden = false;
      }
    }

    function reorder() {
      if (grid.querySelector('[data-turning]')) return;
      const focused = document.activeElement?.closest('[data-team-id]');
      const anchor = order.includes(focused) ? focused : order.includes(openCard) ? openCard : null;
      const index = anchor ? order.indexOf(anchor) : order.length;
      let next = anchor;
      for (const card of order.slice(0, index).reverse()) {
        if (card.nextElementSibling !== next) grid.insertBefore(card, next);
        next = card;
      }
      if (!anchor) return;
      let previous = anchor;
      for (const card of order.slice(index + 1)) {
        if (previous.nextElementSibling !== card) grid.insertBefore(card, previous.nextElementSibling);
        previous = card;
      }
    }

    initial.forEach(bind);
    staticCards.addEventListener('change', () => {
      const focused = document.activeElement?.closest('[data-team-id]');
      clearHover();
      openCard = openBy = mouseOverCard = null;
      grid.setAttribute('data-team-switching', '');
      cards.forEach(configureMode);
      if (order.includes(focused)) focusCard(focused);
      reorder();
      requestAnimationFrame(() => requestAnimationFrame(() => grid.removeAttribute('data-team-switching')));
    });
    grid.addEventListener('team-flip-settled', reorder);
    grid.addEventListener('focusin', event => {
      if (staticCards.matches || restoringFocus || !event.target.matches(':focus-visible')) return;
      const card = event.target.closest('[data-team-id]');
      if (!card) return;
      show(card, 'keyboard');
      openBy = 'keyboard';
    });
    grid.addEventListener('focusout', event => {
      if (!restoringFocus && openBy === 'keyboard' && openCard?.contains(event.target) &&
          !openCard.contains(event.relatedTarget)) show(null);
    });
    grid.addEventListener('click', event => {
      if (staticCards.matches) return;
      const trigger = event.target.closest('.team-card-toggle');
      if (!trigger) return;
      const keyboard = event.detail === 0;
      if (!keyboard && (event.pointerType || lastPointerType) === 'mouse' && canHover.matches) return;
      const card = trigger.closest('[data-team-id]');
      show(openCard === card ? null : card, keyboard ? 'keyboard' : 'tap');
    });

    return people => {
      const ids = new Set(people.map(person => person.id));
      const focused = document.activeElement;
      let restoreFocus = false;
      for (const [id, card] of cards) {
        if (ids.has(id)) continue;
        restoreFocus ||= card.contains(focused);
        if (hoverCard === card) clearHover();
        if (mouseOverCard === card) mouseOverCard = null;
        if (openCard === card) {
          openCard = null;
          openBy = null;
        }
        clearTimeout(animations.get(card));
        card.remove();
        cards.delete(id);
      }

      // Prefer a member's supplied fallback over an image already assigned to someone else.
      const photos = new Set();
      const byId = new Map();
      const sorted = [...people].sort((a, b) =>
        Number(company.photoUrl(b.photo) === fallbackPhotos.get(b.id)) -
        Number(company.photoUrl(a.photo) === fallbackPhotos.get(a.id))
      );
      for (const person of sorted) {
        let card = cards.get(person.id);
        if (!card) {
          card = template.cloneNode(true);
          card.dataset.teamId = person.id;
          cards.set(person.id, card);
          grid.append(card);
          bind(card);
        }
        update(card, person, photos);
        photos.add(card.querySelector('[data-team-photo]').getAttribute('src'));
        byId.set(person.id, card);
      }
      order = people.map(person => byId.get(person.id));
      reorder();
      if (restoreFocus && order.length) focusCard(order[0]);
    };
  }

  document.addEventListener('pointerdown', event => {
    if (staticCards.matches) return;
    lastPointerType = event.pointerType;
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      clearHover();
      mouseOverCard?.removeAttribute('data-mouse-over');
      mouseOverCard = null;
    }
    if (openBy === 'tap' && !openCard.contains(event.target)) show(null);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || (!openCard && !hoverCard)) return;
    event.preventDefault();
    show(null);
  });
  window.QixarcTeamCards = Object.freeze({ mount });
})();
