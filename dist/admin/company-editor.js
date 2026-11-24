(() => {
  function createEditor({ db, authorize, isActive }) {
    const company = window.QixarcCompany;
    const panel = document.querySelector('#company-panel');
    const launchForm = panel.querySelector('#scaler-launch-form');
    const teamForm = panel.querySelector('#team-member-form');
    const portraitPreview = teamForm.querySelector('[data-current-portrait]');
    const peopleList = panel.querySelector('#company-team-list');
    const addButton = panel.querySelector('#new-team-member');
    const feedback = panel.querySelector('[data-company-feedback]');
    const refresh = panel.querySelector('#refresh-company');
    const resetTeam = panel.querySelector('#reset-team-defaults');
    const indiaOffset = 330 * 60 * 1000;
    const toIndiaInput = date => new Date(date + indiaOffset).toISOString().slice(0, 16);
    const say = message => { if (isActive()) feedback.textContent = message; };
    let rows = {}, people = [], request = 0, saving = false, loading = false, launchDirty = false;

    function hideMember() {
      teamForm.hidden = true;
      teamForm.reset();
    }

    function reset() {
      request++;
      loading = false;
      launchDirty = false;
      rows = {};
      people = [];
      hideMember();
      launchForm.reset();
      launchForm.querySelector('fieldset').disabled = true;
      addButton.disabled = resetTeam.disabled = true;
      peopleList.replaceChildren();
      feedback.textContent = '';
    }

    function openMember(person) {
      hideMember();
      const fields = teamForm.elements;
      fields.id.value = person?.id || '';
      fields.name.value = person?.name || '';
      fields.role.value = person?.role || '';
      fields.portfolio.value = person?.portfolio || '';
      fields.photoFocus.value = person?.photoFocus || '';
      teamForm.querySelector('h3').textContent = person ? 'Edit team member' : 'Add team member';
      const url = person && company.photoUrl(person.photo);
      portraitPreview.hidden = !url;
      if (url) portraitPreview.src = url;
      else portraitPreview.removeAttribute('src');
      positionPortraitPreview();
      teamForm.hidden = false;
      fields.name.focus();
    }

    function positionPortraitPreview() {
      const focus = company.photoFocus(teamForm.elements.photoFocus.value);
      portraitPreview.style.objectPosition = focus || company.defaultPhotoFocus;
    }

    function drawPeople() {
      peopleList.replaceChildren(...people.map(person => {
        const item = document.createElement('li');
        const label = document.createElement('span');
        label.textContent = person.name + ' · ' + person.role;
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'button outline';
        edit.textContent = 'Edit';
        edit.setAttribute('aria-label', 'Edit ' + person.name);
        edit.addEventListener('click', () => { if (!saving) openMember(person); });
        item.append(label, edit);
        return item;
      }));
      addButton.disabled = people.length >= 24;
      resetTeam.disabled = false;
    }

    async function load({ preserve = false } = {}) {
      if (saving) return;
      if (!preserve) reset();
      const ticket = ++request;
      const previous = rows;
      const keepMember = preserve && !teamForm.hidden;
      const keepLaunch = preserve && launchDirty;
      loading = true;
      say('Loading website settings…');
      try {
        const saved = await company.read();
        const base = saved.launch && saved.team ? {} : await company.defaults();
        if (ticket !== request || !isActive()) return;
        const dates = company.launch(saved.launch?.payload ?? base.launch);
        const roster = company.team(saved.team?.payload ?? base.team);
        if (!dates || !roster) throw new Error('Invalid settings');
        rows = saved;
        people = roster;
        if (!keepLaunch) {
          launchForm.elements.early.value = toIndiaInput(dates.early);
          launchForm.elements.full.value = toIndiaInput(dates.full);
        }
        launchForm.querySelector('fieldset').disabled = false;
        drawPeople();
        const changedTeam = keepMember && previous.team?.revision !== saved.team?.revision;
        const changedLaunch = keepLaunch && previous.launch?.revision !== saved.launch?.revision;
        say(changedTeam || changedLaunch
          ? 'Saved settings changed. Your inputs were kept. Review them before saving again.'
          : keepMember || keepLaunch ? 'Settings refreshed. Your unsaved inputs were kept.' : '');
      } catch (error) {
        console.warn('[QIXARC] Website settings refresh failed:', error?.code || error?.message);
        if (ticket === request) say('Could not refresh website settings. Your unsaved inputs are still here.');
      } finally {
        if (ticket === request) loading = false;
      }
    }

    async function save(key, payload) {
      const previous = rows[key];
      const table = db.from('qixarc_site_settings');
      const revision = (previous?.revision ?? 0) + 1;
      const query = previous
        ? table.update({ payload, revision }).eq('key', key).eq('revision', previous.revision)
        : table.insert({ key, payload });
      const { data, error, status } = await query.select('key,payload,revision').maybeSingle();
      if (error || !data) {
        const conflict = error?.code === '23505' || !error;
        const failure = new Error(conflict
          ? 'Someone else saved these settings first. Refresh before applying your changes.'
          : 'The changes could not be saved. Your edits are still here. Please retry.');
        failure.writeRejected = conflict || (status >= 400 && status < 500 && status !== 408);
        throw failure;
      }
      if (data.key !== key || data.revision !== revision) {
        throw new Error('The save response could not be verified. Your edits are still here.');
      }
      rows[key] = data;
      return data;
    }

    async function submit(button, action) {
      if (saving || loading || !isActive()) return;
      const ticket = request;
      saving = true;
      button.disabled = refresh.disabled = true;
      say('Saving…');
      try {
        if (!await authorize({ preserveOnConnectionError: true }) || ticket !== request || !isActive()) return;
        await action(() => ticket === request && isActive());
      } catch (error) {
        if (ticket === request) say(error.message || 'Could not save. Please retry.');
      } finally {
        saving = false;
        button.disabled = refresh.disabled = false;
      }
    }

    launchForm.addEventListener('input', () => { launchDirty = true; });
    launchForm.addEventListener('submit', event => {
      event.preventDefault();
      const { early, full } = launchForm.elements;
      const payload = { early: early.value + ':00+05:30', full: full.value + ':00+05:30' };
      if (!company.launch(payload)) { say('Full access must launch after early access.'); return; }
      submit(launchForm.querySelector('[type=submit]'), async active => {
        await save('launch', payload);
        if (active()) { launchDirty = false; say('Launch schedule saved.'); }
      });
    });

    async function uploadPortrait(file) {
      if (file.size > 15 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Choose a JPG, PNG or WebP photo under 15 MB.');
      }
      const image = await createImageBitmap(file).catch(() => { throw new Error('This photo could not be opened.'); });
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 720 / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      try { canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); }
      finally { image.close(); }
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', .83));
      if (!blob || blob.type !== 'image/webp' || blob.size > 524288) {
        throw new Error('This photo could not be prepared. Try a smaller image.');
      }
      const path = crypto.randomUUID() + '.webp';
      const { error } = await db.storage.from(company.bucket).upload(path, blob, {
        contentType: 'image/webp', cacheControl: '31536000', upsert: false
      });
      if (error) throw new Error('Could not upload the portrait. Check the connection and retry.');
      return path;
    }

    async function removeUnusedPortrait(key) {
      if (!key) return true;
      try {
        const { data, error } = await db.storage.from(company.bucket).remove([key]);
        if (error || !data?.length) throw new Error(error?.code || 'deletion was not confirmed');
        return true;
      } catch (error) {
        console.warn('[QIXARC] Portrait cleanup not confirmed:', error?.message);
        return false;
      }
    }

    function removedPortraits(before, after) {
      const retained = new Set(after.map(person => company.photoKey(person.photo)));
      return [...new Set(before.map(person => company.photoKey(person.photo)))]
        .filter(key => key && !retained.has(key));
    }

    async function saveRoster(updated, active, newPhoto = '') {
      const oldRoster = people;
      const oldRevision = rows.team?.revision;
      let saved;
      try {
        if (!active()) {
          await removeUnusedPortrait(newPhoto);
          return;
        }
        saved = await save('team', updated);
      } catch (error) {
        let rejected = error.writeRejected === true;
        if (newPhoto && !rejected) {
          // A dropped response can hide a committed write. A newer revision also fences off
          // an earlier request still in flight before we attempt to remove its portrait.
          try {
            const latest = (await company.read()).team;
            if (latest?.revision > (oldRevision ?? 0)) {
              const roster = company.team(latest.payload);
              const referenced = roster?.some(person => company.photoKey(person.photo) === newPhoto);
              if (referenced && JSON.stringify(roster) === JSON.stringify(updated)) {
                rows.team = saved = latest;
              } else if (roster && !referenced) rejected = true;
            }
          } catch (readError) {
            console.warn('[QIXARC] Could not verify portrait references:', readError?.message);
          }
        }
        if (!saved) {
          if (newPhoto && (!rejected || !await removeUnusedPortrait(newPhoto))) {
            console.warn('[QIXARC] A newly uploaded portrait needs follow-up cleanup.');
            throw new Error(error.message + ' Portrait cleanup could not be confirmed.');
          }
          throw error;
        }
      }
      const roster = company.team(saved.payload) || updated;
      if (active()) {
        people = roster;
        hideMember();
        drawPeople();
        say('Team roster saved.');
      }
      const results = await Promise.all(removedPortraits(oldRoster, roster).map(removeUnusedPortrait));
      if (active() && results.includes(false)) say('Team roster saved. Cleanup of an old portrait could not be confirmed.');
    }

    teamForm.elements.photoFocus.addEventListener('input', positionPortraitPreview);
    teamForm.addEventListener('submit', event => {
      event.preventDefault();
      const fields = teamForm.elements;
      const id = fields.id.value || crypto.randomUUID();
      const existing = people.find(person => person.id === id);
      if (fields.id.value && !existing) {
        say('This member was removed from the saved roster. Your edits are still here.');
        return;
      }
      const person = {
        id, name: fields.name.value.trim(), role: fields.role.value.trim(),
        portfolio: company.webUrl(fields.portfolio.value.trim()), photo: existing?.photo || ''
      };
      const focus = company.photoFocus(fields.photoFocus.value);
      if (fields.photoFocus.value.trim() && !focus) {
        say('Enter two percentages from 0% to 100% for photo focus, for example 50% 20%.');
        return;
      }
      if (focus) person.photoFocus = focus;
      const updated = existing ? people.map(item => item.id === id ? person : item) : [...people, person];
      if (!company.team(updated)) { say('Enter a name, role and a valid web, email or phone link.'); return; }
      const file = fields.photo.files[0];
      submit(teamForm.querySelector('[type=submit]'), async active => {
        const newPhoto = file ? await uploadPortrait(file) : '';
        if (newPhoto) person.photo = company.photoUrl(newPhoto);
        await saveRoster(updated, active, newPhoto);
      });
    });

    addButton.addEventListener('click', () => { if (!saving) openMember(); });
    panel.querySelector('#cancel-team-edit').addEventListener('click', () => { if (!saving) hideMember(); });
    resetTeam.addEventListener('click', () => {
      if (saving || loading || !confirm('Replace the saved team roster with the website defaults? This also discards any open team edits.')) return;
      submit(resetTeam, async active => {
        const defaults = company.team((await company.defaults()).team);
        if (!defaults) throw new Error('Team defaults could not be loaded.');
        await saveRoster(defaults, active);
      });
    });
    refresh.addEventListener('click', () => load({ preserve: true }));
    return { load, reset, hasDraft: () => !teamForm.hidden || launchDirty, isSaving: () => saving };
  }

  window.QixarcCompanyEditor = Object.freeze({ createEditor });
})();
