(() => {
  const bucket = 'qixarc-team-photos';
  const bucketPath = '/storage/v1/object/public/' + bucket + '/';
  const photoPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\.webp$/;
  const webUrl = value => {
    if (typeof value !== 'string') return '';
    try {
      const url = new URL(value.trim());
      if (url.username || url.password) return '';
      if (['http:', 'https:'].includes(url.protocol)) return url.href;
      if (['mailto:', 'tel:'].includes(url.protocol) && url.pathname) return url.href;
    } catch {}
    return '';
  };
  const photoKey = value => {
    if (typeof value !== 'string') return '';
    if (photoPattern.test(value)) return value;
    const origin = window.QIXARC_SUPABASE?.url;
    if (!origin || !value.startsWith(origin + bucketPath)) return '';
    const key = value.slice((origin + bucketPath).length);
    return photoPattern.test(key) ? key : '';
  };
  const photoUrl = value => {
    if (/^\/assets\/[a-z0-9.-]+\.webp$/.test(value)) return value;
    const key = photoKey(value);
    const origin = window.QIXARC_SUPABASE?.url;
    return key && origin ? origin + bucketPath + key : '';
  };
  const defaultPhotoFocus = '50% 20%';
  const photoFocus = value => {
    if (typeof value !== 'string') return '';
    const match = /^(\d{1,3})%\s+(\d{1,3})%$/.exec(value.trim());
    if (!match || Number(match[1]) > 100 || Number(match[2]) > 100) return '';
    return `${Number(match[1])}% ${Number(match[2])}%`;
  };
  const launch = value => {
    const early = Date.parse(value?.early);
    const full = Date.parse(value?.full);
    return Number.isFinite(early) && Number.isFinite(full) && early < full ? { early, full } : null;
  };
  const team = value => {
    if (!Array.isArray(value) || value.length < 1 || value.length > 24) return null;
    const people = value.map(person => {
      if (!person || typeof person.id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(person.id) ||
          typeof person.name !== 'string' || typeof person.role !== 'string') return null;
      const name = person.name.trim();
      const role = person.role.trim();
      const portfolio = webUrl(person.portfolio);
      if (!name || name.length > 80 || !role || role.length > 80 || !portfolio || portfolio.length > 2048) return null;
      const member = { id: person.id, name, role, portfolio, photo: photoUrl(person.photo) ? person.photo : '' };
      const focus = photoFocus(person.photoFocus);
      if (focus) member.photoFocus = focus;
      return member;
    });
    return people.every(Boolean) && new Set(people.map(person => person.id)).size === people.length ? people : null;
  };

  let defaultRequest;
  const defaults = () => defaultRequest ??= fetch('/site-defaults.json', { signal: AbortSignal.timeout(5000) }).then(response => {
    if (!response.ok) throw new Error('Site defaults are unavailable');
    return response.json();
  }).catch(error => {
    defaultRequest = undefined;
    throw error;
  });
  const read = async () => {
    if (!window.qixarcDB) throw new Error('Connection unavailable');
    const result = await window.qixarcDB.from('qixarc_site_settings')
      .select('key,payload,revision').abortSignal(AbortSignal.timeout(6000));
    if (result.error) throw new Error(result.error.code || result.error.message || 'Settings could not be loaded');
    return Object.fromEntries(result.data.map(row => [row.key, row]));
  };

  function stage(schedule, now) {
    if (now < schedule.early) return { status: 'Early access scheduled', label: 'Early access launches in', target: schedule.early };
    if (now < schedule.full) return { status: 'Early access deployed', label: 'Early access deployed. Full access launches in', target: schedule.full };
    return { status: 'Full access deployed', label: 'Full access deployed', target: null };
  }

  window.QixarcCompany = Object.freeze({ defaults, read, webUrl, bucket, photoKey, photoUrl, photoFocus, defaultPhotoFocus, launch, team, stage });
})();
