(() => {
  const db = window.qixarcDB;
  const status = document.querySelector('#admin-status');
  const dashboard = document.querySelector('#dashboard');
  const list = document.querySelector('#admin-list');
  const editor = document.querySelector('#editor');
  const form = document.querySelector('#content-form');
  let current = 'enquiries', offset = 0, generation = 0, verified = false;
  const say = message => { status.textContent = message; };
  const element = (tag, text, className) => { const e = document.createElement(tag); e.textContent = text; if (className) e.className = className; return e; };
  function lock() {
    verified = false; generation++;
    dashboard.hidden = true; list.replaceChildren(); editor.hidden = true; form.reset();
    document.querySelector('#login-panel').hidden = false;
    document.querySelector('#logout').hidden = true;
  }
  async function authorize() {
    const { data, error } = await db.auth.getUser();
    if (error || !data.user) { lock(); return false; }
    const result = await db.from('qixarc_admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
    if (result.error || !result.data) { lock(); say('This account does not have admin access.'); return false; }
    verified = true; dashboard.hidden = false;
    document.querySelector('#login-panel').hidden = true; document.querySelector('#logout').hidden = false;
    return true;
  }
  function openEditor(row = {}) {
    form.reset();
    delete form.elements.slug.dataset.edited;
    for (const key of ['id','title','slug','summary','body','status']) form.elements[key].value = row[key] || (key === 'status' ? 'draft' : '');
    document.querySelector('#editor-title').textContent = row.id ? 'Edit entry' : `New ${current === 'blog' ? 'blog post' : 'R&D update'}`;
    editor.hidden = false; form.elements.title.focus();
  }
  async function load(more = false) {
    if (!verified) return;
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
          const result = await db.from('qixarc_enquiries').update({ status: select.value }).eq('id', row.id).select('id').single();
          select.disabled = false;
          if (result.error) { select.value = row.status; say('Status could not be saved. Please try again.'); }
          else { row.status = select.value; card.querySelector('.record-meta').textContent = `${new Date(row.created_at).toLocaleString()} · ${row.status}`; say('Enquiry status saved.'); }
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
    if (!db) { say('Database connection is unavailable. Reload and try again.'); return; }
    if (login.elements.username.value.trim() !== 'user') { say('Incorrect username or password.'); return; }
    button.disabled = true; say('Signing in…');
    try {
      const { error } = await db.auth.signInWithPassword({ email: window.QIXARC_SUPABASE.adminEmail, password: login.elements.password.value });
      login.elements.password.value = '';
      if (error) { say('Incorrect login, or sign-in temporarily unavailable. Please try again.'); return; }
      if (await authorize()) await load();
    } catch { say('Unable to connect. Check your connection and retry.'); }
    finally { button.disabled = false; }
  });
  document.querySelector('#logout').addEventListener('click', async () => {
    lock(); const { error } = await db.auth.signOut();
    if (error) { await db.auth.signOut({ scope: 'local' }); say('Signed out on this device. Other sessions could not be revoked.'); }
    else say('Signed out.');
  });
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
    if (!editor.hidden && !confirm('Discard unsaved editor changes?')) return;
    current = button.dataset.tab; editor.hidden = true;
    document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.querySelector('#workspace-title').textContent = button.textContent;
    document.querySelector('#new-content').hidden = current === 'enquiries'; load();
  }));
  document.querySelector('#refresh').addEventListener('click', () => load());
  document.querySelector('#load-more').addEventListener('click', () => load(true));
  document.querySelector('#new-content').addEventListener('click', () => openEditor());
  document.querySelector('#cancel-edit').addEventListener('click', () => { editor.hidden = true; form.reset(); });
  form.elements.title.addEventListener('input', () => {
    if (!form.elements.id.value && !form.elements.slug.dataset.edited) form.elements.slug.value = form.elements.title.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0,100);
  });
  form.elements.slug.addEventListener('input', () => { form.elements.slug.dataset.edited = 'true'; });
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (!verified || current === 'enquiries') return;
    const button = form.querySelector('[type=submit]'); button.disabled = true; say('Saving…');
    const row = { kind: current, title: form.elements.title.value.trim(), slug: form.elements.slug.value.trim(), summary: form.elements.summary.value.trim(), body: form.elements.body.value.trim(), status: form.elements.status.value, updated_at: new Date().toISOString() };
    try {
      const id = form.elements.id.value;
      const query = id ? db.from('qixarc_content').update(row).eq('id', id) : db.from('qixarc_content').insert(row);
      const { error } = await query.select('id').single();
      if (error) { say(error.code === '23505' ? 'That URL slug is already in use. Choose another.' : 'Could not save. Your edits are still here; please retry.'); return; }
      editor.hidden = true; form.reset(); delete form.elements.slug.dataset.edited;
      await load(); say(row.status === 'published' ? 'Published. The public page now uses this content.' : 'Draft saved. Only admins can see it.');
    } catch { say('Connection interrupted. Your edits are still here; please retry.'); }
    finally { button.disabled = false; }
  });
  if (!db) { say('Database connection is unavailable. Please reload.'); return; }
  db.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') lock(); });
  authorize().then(ok => { if (ok) load(); }).catch(() => say('Could not restore your session. Please sign in.'));
})();
