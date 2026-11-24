(() => {
  const company = window.QixarcCompany;
  const widgets = document.querySelectorAll('[data-scaler-launch]');
  const labels = document.querySelectorAll('[data-scaler-status]');
  const grids = document.querySelectorAll('[data-team-grid]');
  const dateFormat = new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeZone: 'Asia/Kolkata' });
  let schedule = widgets.length ? company.launch(widgets[0].dataset) : null;

  function countdown(milliseconds) {
    let seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    return [[86400, 'd'], [3600, 'h'], [60, 'm'], [1, 's']].map(([unit, label]) => {
      const amount = Math.floor(seconds / unit);
      seconds %= unit;
      return String(amount).padStart(2, '0') + label;
    }).join(' ');
  }

  function updateLaunch() {
    if (!schedule) return;
    const now = Date.now();
    const current = company.stage(schedule, now);
    for (const label of labels) {
      if (label.textContent !== current.status) label.textContent = current.status;
    }
    for (const widget of widgets) {
      const stage = widget.querySelector('[data-launch-stage]');
      const clock = widget.querySelector('[data-launch-clock]');
      const date = widget.querySelector('[data-full-date]');
      if (stage.textContent !== current.label) stage.textContent = current.label;
      clock.hidden = current.target === null;
      if (current.target !== null) clock.textContent = countdown(current.target - now);
      date.parentElement.hidden = current.target !== schedule.early;
      if (!date.parentElement.hidden) {
        date.dateTime = new Date(schedule.full).toISOString();
        date.textContent = dateFormat.format(schedule.full);
      }
    }
  }

  function profile(person, template) {
    const card = template.cloneNode(true);
    const back = card.querySelector('.team-profile-back');
    const trigger = card.querySelector('.team-flip-trigger');
    card.querySelector('h3').textContent = person.name;
    card.querySelector('p').textContent = person.role;
    back.id = 'team-photo-' + person.id;
    trigger.setAttribute('aria-controls', back.id);
    trigger.setAttribute('aria-label', 'Show ' + person.name + '’s portrait');
    back.querySelector('button').setAttribute('aria-label', 'Show ' + person.name + '’s details');
    for (const link of card.querySelectorAll('[data-team-portfolio]')) {
      link.href = person.portfolio;
      link.setAttribute('aria-label', 'Open ' + person.name + '’s portfolio in a new tab');
    }

    const url = company.photoUrl(person.photo);
    const portrait = document.createElement(url ? 'img' : 'span');
    if (url) {
      portrait.src = url;
      portrait.alt = '';
      portrait.loading = 'lazy';
      portrait.decoding = 'async';
    } else {
      portrait.className = 'team-initials';
      portrait.setAttribute('aria-hidden', 'true');
      portrait.textContent = person.name[0];
    }
    back.querySelector('.team-profile-portrait').replaceChildren(portrait);
    return card;
  }

  function bindGrid(grid) {
    let activeCard;
    for (const card of grid.querySelectorAll('.team-profile')) {
      const front = card.querySelector('.team-profile-front');
      const back = card.querySelector('.team-profile-back');
      const trigger = front.querySelector('.team-flip-trigger');
      const link = back.querySelector('[data-team-portfolio]');
      const close = back.querySelector('button');
      let hoverOpened = false;

      function setFlipped(flipped, moveFocus = false) {
        if (flipped === card.hasAttribute('data-flipped')) return;
        if (flipped && activeCard?.card !== card) activeCard?.close();
        const incoming = flipped ? back : front;
        const outgoing = flipped ? front : back;
        incoming.inert = false;
        card.toggleAttribute('data-flipped', flipped);
        trigger.setAttribute('aria-expanded', String(flipped));
        if (moveFocus || outgoing.contains(document.activeElement)) {
          (flipped ? link : trigger).focus({ preventScroll: true });
        }
        outgoing.inert = true;
        if (flipped) activeCard = { card, close: () => setFlipped(false) };
        else { activeCard = undefined; hoverOpened = false; }
      }

      trigger.hidden = false;
      back.hidden = false;
      front.querySelector('[data-team-portfolio]').hidden = true;
      trigger.addEventListener('click', () => setFlipped(true, true));
      close.addEventListener('click', () => setFlipped(false, true));

      card.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'mouse' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (activeCard?.card !== card && activeCard?.card.contains(document.activeElement)) return;
        if (!card.hasAttribute('data-flipped')) { hoverOpened = true; setFlipped(true); }
      });
      card.addEventListener('pointerleave', () => {
        if (hoverOpened && !card.contains(document.activeElement)) setFlipped(false);
      });
      card.addEventListener('focusout', event => {
        if (hoverOpened && !card.contains(event.relatedTarget) && !card.matches(':hover')) setFlipped(false);
      });
      card.addEventListener('keydown', event => {
        if (event.key === 'Escape' && card.hasAttribute('data-flipped')) {
          event.preventDefault();
          setFlipped(false, true);
        }
      });
    }
  }

  const teamGrids = [...grids].map(grid => {
    const template = grid.querySelector('.team-profile').cloneNode(true);
    bindGrid(grid);
    return { grid, template };
  });
  if (labels.length || widgets.length) {
    updateLaunch();
    setInterval(updateLaunch, 250);
    if (!schedule) company.defaults().then(data => { schedule ??= company.launch(data.launch); updateLaunch(); }).catch(() => {});
  }

  company.read().then(rows => {
    schedule = company.launch(rows.launch?.payload) || schedule;
    updateLaunch();
    const people = company.team(rows.team?.payload);
    if (!people) return;
    for (const { grid, template } of teamGrids) {
      if (grid.contains(document.activeElement) || grid.querySelector('[data-flipped]')) continue;
      grid.replaceChildren(...people.map(person => profile(person, template)));
      bindGrid(grid);
    }
  }).catch(() => {});
})();
