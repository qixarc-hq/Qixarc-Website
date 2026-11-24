(() => {
  const db = window.qixarcDB;
  const status = document.querySelector('#admin-status');
  const dashboard = document.querySelector('#dashboard');
  const list = document.querySelector('#admin-list');
  const editor = document.querySelector('#editor');
  const form = document.querySelector('#content-form');
  const conflictPanel = document.querySelector('#content-conflict');
  const latestContent = document.querySelector('#latest-content');
  const acceptVersion = document.querySelector('#accept-content-version');
  let contentBase = null, newerContent = null, contentSaving = false;
  const passwordForm = document.querySelector('#password-form');
  const security = window.QixarcSecurity;
  const idleLimit = 15 * 60 * 1000;
  let current = 'enquiries', offset = 0, generation = 0, authGeneration = 0, verified = false;
  let idleTimer, lastActivity = 0;
  try { lastActivity = Number(sessionStorage.getItem('qixarc-admin-activity')) || 0; } catch {}
  const say = message => { status.textContent = message; };
  const element = (tag, text, className) => { const e = document.createElement(tag); e.textContent = text; if (className) e.className = className; return e; };
  const companyEditor = window.QixarcCompanyEditor.createEditor({
    db, authorize, isActive: () => verified && current === 'company'
  });

  function lock() {
    companyEditor.reset();
    verified = false; generation++; authGeneration++; clearTimeout(idleTimer);
    dashboard.hidden = true; list.replaceChildren(); closeContentEditor();
    passwordForm.reset();
    document.querySelector('#password-status').textContent = '';
    document.querySelector('#session-status').textContent = '';
    document.querySelector('#account-email').textContent = '—';
    document.querySelector('#account-signin').textContent = '—';
    document.querySelector('#login-form').elements.password.value = '';
    document.querySelector('#login-panel').hidden = false;
    document.querySelector('#logout').hidden = true;
  }
  function connectionFailure(error, status = error?.status) {
    return error && (error.name === 'AuthRetryableFetchError' || error.code === '' || status === 0 || status >= 500);
  }

  async function authorize({ preserveOnConnectionError = false } = {}) {
    const ticket = ++authGeneration;
    const { data, error } = await db.auth.getUser();
    if (ticket !== authGeneration) return false;
    if (preserveOnConnectionError && connectionFailure(error)) {
      throw new Error('Could not verify your session. Your edits are still here. Please retry.');
    }
    if (error || !data?.user) { lock(); return false; }
    const result = await db.from('qixarc_admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
    if (ticket !== authGeneration) return false;
    if (preserveOnConnectionError && connectionFailure(result.error, result.status)) {
      throw new Error('Could not verify your admin access. Your edits are still here. Please retry.');
    }
    if (result.error || !result.data) { lock(); say('This account does not have admin access.'); return false; }
    if (lastActivity && Date.now() - lastActivity >= idleLimit) {
      await endSession('local', 'Session locked after 15 minutes of inactivity. Sign in again.');
      return false;
    }
    verified = true; dashboard.hidden = false;
    document.querySelector('#login-panel').hidden = true; document.querySelector('#logout').hidden = false;
    document.querySelector('#account-email').textContent = data.user.email || 'Admin';
    document.querySelector('#account-signin').textContent = data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at).toLocaleString() : 'Not available';
    if (!lastActivity) recordActivity();
    scheduleIdle();
    return true;
  }
  function recordActivity() {
    lastActivity = Date.now();
    try { sessionStorage.setItem('qixarc-admin-activity', String(lastActivity)); } catch {}
  }
  function scheduleIdle() {
    clearTimeout(idleTimer);
    if (verified) idleTimer = setTimeout(checkIdle, Math.max(0, idleLimit - (Date.now() - lastActivity)));
  }
  function checkIdle() {
    if (!verified) return;
    if (Date.now() - lastActivity >= idleLimit) endSession('local', 'Session locked after 15 minutes of inactivity. Sign in again.');
    else scheduleIdle();
  }
  async function endSession(scope, message) {
    lock();
    lastActivity = 0;
    try { sessionStorage.removeItem('qixarc-admin-activity'); } catch {}
    const revoked = await security.endSessions(db.auth, scope);
    if (!revoked) {
      try { sessionStorage.removeItem('qixarc-admin-session'); } catch {}
    }
    say(revoked ? message : 'Dashboard locked. Session revocation could not be confirmed. Close this tab, or reconnect and sign out again.');
  }
  ['pointerdown', 'keydown', 'scroll'].forEach(type => document.addEventListener(type, () => {
    if (!verified) return;
    if (Date.now() - lastActivity >= idleLimit) { checkIdle(); return; }
    if (Date.now() - lastActivity > 1000) recordActivity();
  }, {passive: true}));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkIdle(); });
  window.addEventListener('pagehide', lock);
  window.addEventListener('pageshow', event => {
    if (event.persisted) authorize().then(ok => { if (ok && current !== 'security') load(); }).catch(() => { lock(); say('Please sign in again.'); });
  });
  function clearContentConflict() {
    newerContent = null;
    conflictPanel.hidden = true;
    latestContent.textContent = '';
    conflictPanel.querySelector('details').open = false;
  }

  function closeContentEditor() {
    contentBase = null;
    editor.hidden = true;
    form.reset();
    delete form.elements.slug.dataset.edited;
    clearContentConflict();
  }

  function openEditor(row = {}) {
    if (!verified || contentSaving || !['blog', 'research'].includes(current)) return;
    closeContentEditor();
    contentBase = { kind: current, id: row.id || '', updatedAt: row.updated_at };

    for (const key of ['id','title','slug','summary','body','status']) form.elements[key].value = row[key] || (key === 'status' ? 'draft' : '');
    document.querySelector('#editor-title').textContent = row.id ? 'Edit entry' : `New ${current === 'blog' ? 'blog post' : 'R&D update'}`;
    editor.hidden = false; form.elements.title.focus();
  }
  async function load(more = false) {
    if (!verified || current === 'security') return;
    if (current === 'company') { await companyEditor.load(); return; }
    const ticket = ++generation;
    const tab = current;
    if (!more) { offset = 0; list.replaceChildren(); }
    say('Loading…');
    document.querySelector('#load-more').hidden = true;
    let query = db.from(tab === 'enquiries' ? 'qixarc_enquiries' : 'qixarc_content').select('*').order('created_at', { ascending: false }).range(offset, offset + 49);
    if (tab !== 'enquiries') query = query.eq('kind', tab);
    const { data, error } = await query;
    if (ticket !== generation || !verified) return;
    if (error) { say('Could not load records. Check your connection and try Refresh.'); return; }
    say(data.length || offset ? '' : 'No entries yet.');
    data.forEach(row => {
      const card = element('article', '', 'admin-record');
      card.append(element('h3', row.title || row.name), element('p', `${new Date(row.created_at).toLocaleString()} · ${row.status}`, 'record-meta'));
      if (tab === 'enquiries') {
        const email = element('a', row.email); email.href = `mailto:${row.email}`;
        card.append(email, element('p', row.service), element('p', row.message, 'record-body'));
        const actions = element('div', '', 'record-actions');
        const label = element('label', 'Status'); const select = document.createElement('select');
        ['new','read','archived'].forEach(value => { const option = element('option', value); option.value = value; select.append(option); });
        select.value = row.status; label.append(select); actions.append(label); card.append(actions);
        select.addEventListener('change', async () => {
          select.disabled = true;
          try {
            if (!await authorize()) return;
            const result = await db.from('qixarc_enquiries').update({ status: select.value }).eq('id', row.id).select('id').single();
            if (!verified) return;
            if (result.error) { select.value = row.status; say('Status could not be saved. Please try again.'); }
            else { row.status = select.value; card.querySelector('.record-meta').textContent = `${new Date(row.created_at).toLocaleString()} · ${row.status}`; say('Enquiry status saved.'); }
          } catch { select.value = row.status; say('Status could not be saved. Please retry.'); }
          finally { select.disabled = false; }
        });
      } else {
        card.append(element('p', row.summary));
        const actions = element('div', '', 'record-actions');
        const edit = element('button', 'Edit', 'button outline'); edit.addEventListener('click', () => openEditor(row)); actions.append(edit);
        if (row.status === 'published') {
          const link = element('a', 'View on website ↗', 'text-link');
          link.href = row.kind === 'blog' ? `/blog/post/?slug=${encodeURIComponent(row.slug)}` : `/research/#research-${row.slug}`;
          link.target = '_blank'; link.rel = 'noopener'; actions.append(link);
        }
        card.append(actions);
      }
      list.append(card);
    });
    offset += data.length;
    document.querySelector('#load-more').hidden = data.length < 50;
  }
  document.querySelector('#login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const login = event.currentTarget; const button = login.querySelector('button');
    if (button.disabled) return;
    if (!db) { say('Database connection is unavailable. Reload and try again.'); return; }
    if (login.elements.username.value.trim() !== 'user') { say('Incorrect username or password.'); return; }
    button.disabled = true; say('Signing in…');
    try {
      const { error } = await db.auth.signInWithPassword({ email: window.QIXARC_SUPABASE.adminEmail, password: login.elements.password.value });
      login.elements.password.value = '';
      if (error) { say('Incorrect login, or sign-in temporarily unavailable. Please try again.'); return; }
      recordActivity();
      if (await authorize()) { say('Signed in.'); await load(); }
    } catch { say('Unable to connect. Check your connection and retry.'); }
    finally { login.elements.password.value = ''; button.disabled = false; }
  });
  document.querySelector('#logout').addEventListener('click', async () => {
    await endSession('local', 'Signed out of this session.');
  });
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
    if (!verified || contentSaving || companyEditor.isSaving() || passwordForm.querySelector('button').disabled) return;
    if (button.dataset.tab === current) return;
    if ((!editor.hidden || (current === 'company' && companyEditor.hasDraft())) &&
        !confirm('Discard unsaved editor changes?')) return;
    current = button.dataset.tab; closeContentEditor();
    generation++; passwordForm.reset();
    const account = current === 'security';
    const company = current === 'company';
    if (!company) companyEditor.reset();
    document.querySelector('#company-panel').hidden = !company;
    document.querySelector('#security-panel').hidden = !account;
    document.querySelector('#records-toolbar').hidden = account || company;
    list.hidden = account || company; list.replaceChildren();
    document.querySelector('#load-more').hidden = true;
    say('');
    document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.querySelector('#workspace-title').textContent = button.textContent;
    document.querySelector('#new-content').hidden = account || company || current === 'enquiries';
    if (!account) load();
  }));
  async function checkContentVersion(base) {
    if (!base?.id || contentBase !== base || !verified) return;
    try {
      const { data, error } = await db.from('qixarc_content').select('title,slug,summary,body,status,updated_at')
        .eq('id', base.id).eq('kind', base.kind).maybeSingle();
      if (!verified || contentBase !== base) return;
      if (error) throw error;
      if (!data) {
        newerContent = null;
        conflictPanel.hidden = true;
        say('This entry is no longer available. Your edits are still here.');
      } else if (data.updated_at !== base.updatedAt) {
        newerContent = data;
        latestContent.textContent = [data.title, data.slug + ' · ' + data.status, data.summary, data.body].join('\n\n');
        conflictPanel.hidden = false;
        say('This entry changed after you opened it. Review the saved version before retrying.');
      }
    } catch {
      if (contentBase === base) say('Could not check the saved version. Your edits are still here.');
    }
  }

  document.querySelector('#refresh').addEventListener('click', async () => {
    if (contentSaving) return;
    const base = contentBase;
    await load();
    await checkContentVersion(base);
  });
  acceptVersion.addEventListener('click', () => {
    if (!contentBase || !newerContent || contentSaving) return;
    contentBase = { ...contentBase, updatedAt: newerContent.updated_at };
    clearContentConflict();
    say('Your edits were kept. Save again when ready.');
  });
  document.querySelector('#load-more').addEventListener('click', () => load(true));
  document.querySelector('#new-content').addEventListener('click', () => openEditor());
  document.querySelector('#cancel-edit').addEventListener('click', () => { if (!contentSaving) closeContentEditor(); });
  form.elements.title.addEventListener('input', () => {
    if (!form.elements.id.value && !form.elements.slug.dataset.edited) form.elements.slug.value = form.elements.title.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0,100);
  });
  form.elements.slug.addEventListener('input', () => { form.elements.slug.dataset.edited = 'true'; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const base = contentBase;
    if (!verified || !base || base.kind !== current || contentSaving) return;
    if (newerContent) { say('Review the saved version before retrying. Your edits are still here.'); return; }
    const button = form.querySelector('[type=submit]');
    const fields = form.elements;
    const updatedAt = Math.max(Date.now(), (Date.parse(base.updatedAt) || 0) + 1);
    const row = {
      kind: base.kind, title: fields.title.value.trim(), slug: fields.slug.value.trim(),
      summary: fields.summary.value.trim(), body: fields.body.value.trim(),
      status: fields.status.value, updated_at: new Date(updatedAt).toISOString()
    };
    contentSaving = button.disabled = true;
    say('Saving…');
    try {
      if (!await authorize({ preserveOnConnectionError: true }) || contentBase !== base) return;
      const table = db.from('qixarc_content');
      const query = base.id
        ? table.update(row).eq('id', base.id).eq('kind', base.kind).eq('updated_at', base.updatedAt)
        : table.insert(row);
      const { data, error } = await query.select('id').maybeSingle();
      if (!verified || contentBase !== base) return;
      if (error) {
        say(error.code === '23505' ? 'That URL slug is already in use. Your edits are still here.' : 'Could not confirm the save. Your edits are still here.');
        return;
      }
      if (!data?.id || (base.id && data.id !== base.id)) {
        say('No changes were saved. Your edits are still here.');
        await checkContentVersion(base);
        return;
      }
      closeContentEditor();
      await load();
      if (verified && current === base.kind) say(row.status === 'published' ? 'Published.' : 'Draft saved.');
    } catch (error) {
      if (contentBase === base) say(error.message || 'Could not confirm the save. Your edits are still here.');
    } finally {
      contentSaving = button.disabled = false;
    }
  });
  passwordForm.addEventListener('submit', async event => {
    event.preventDefault();
    const button = document.querySelector('#change-password');
    const feedback = document.querySelector('#password-status');
    if (!verified || button.disabled || !passwordForm.reportValidity()) return;
    const values = Object.fromEntries(new FormData(passwordForm));
    const invalid = security.passwordError(values);
    if (invalid) { feedback.textContent = invalid; return; }
    const controls = [...document.querySelectorAll('#logout, #security-panel button, [data-tab]')];
    controls.forEach(control => { control.disabled = true; });
    passwordForm.reset(); feedback.textContent = 'Verifying your current password…';
    try {
      const result = await security.changePassword(db.auth, values, authorize, lock);
      lastActivity = 0;
      try { sessionStorage.removeItem('qixarc-admin-activity'); sessionStorage.removeItem('qixarc-admin-session'); } catch {}
      say(result.sessionsRevoked ? 'Password changed. Sign in with your new password. Other sessions will end when their access tokens expire.' : 'Password changed. Sign in with your new password. Other session revocation could not be confirmed; retry Sign out all sessions after signing in.');
    } catch (error) {
      const message = error.message || 'Password could not be changed. Please retry.';
      if (verified) feedback.textContent = message; else say(message);
    } finally {
      passwordForm.reset(); Object.keys(values).forEach(key => { values[key] = ''; });
      controls.forEach(control => { control.disabled = false; });
    }
  });
  document.querySelector('#lock-session').addEventListener('click', () => endSession('local', 'Session locked. Sign in again to continue.'));
  document.querySelector('#logout-all').addEventListener('click', () => endSession('global', 'Signed out. Other sessions will end when their access tokens expire.'));
  document.querySelector('#logout-others').addEventListener('click', async event => {
    const button = event.currentTarget;
    if (!verified || button.disabled) return;
    button.disabled = true;
    const feedback = document.querySelector('#session-status');
    feedback.textContent = 'Signing out other sessions…';
    try {
      if (!await authorize()) return;
      const revoked = await security.endSessions(db.auth, 'others');
      feedback.textContent = revoked ? 'Other sessions cannot renew access. They will end when their current access tokens expire.' : 'Other sessions could not be signed out. Check your connection and retry.';
    } catch { feedback.textContent = 'Unable to verify your session. Please sign in again.'; }
    finally { button.disabled = false; }
  });
  if (!db) { say('Database connection is unavailable. Please reload.'); return; }
  db.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') lock(); });
  authorize().then(ok => { if (ok) load(); }).catch(() => { lock(); say('Could not restore your session. Please sign in.'); });
})();
