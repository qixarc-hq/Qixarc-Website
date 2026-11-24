(() => {
  const company = window.QixarcCompany;
  const cache = window.QixarcPublicContent;
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

  const showRoster = [...grids].map(window.QixarcTeamCards?.mount || (() => () => {}));
  const cachedTeam = grids.length ? company.team(cache.read('team')) : null;
  if (cachedTeam) showRoster.forEach(show => show(cachedTeam));
  if (labels.length || widgets.length) {
    updateLaunch();
    setInterval(updateLaunch, 250);
    if (!schedule) company.defaults().then(data => { schedule ??= company.launch(data.launch); updateLaunch(); }).catch(error => cache.report('Launch defaults unavailable', error));
  }

  company.read().then(rows => {
    schedule = company.launch(rows.launch?.payload) || schedule;
    updateLaunch();
    if (!showRoster.length) return;
    const people = company.team(rows.team?.payload);
    if (!people) throw new Error('Team record missing or invalid');
    cache.write('team', people);
    showRoster.forEach(show => show(people));
  }).catch(error => cache.report('Live website settings unavailable', error));
})();
