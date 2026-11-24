(() => {
  const project = window.QIXARC_SUPABASE?.url || 'qixarc';
  const prefix = 'qixarc-public:v1:' + project + ':';
  const validSlug = slug => typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  const report = (name, error) => {
    console.warn('[QIXARC] ' + name + ': ' + (error?.code || error?.message || 'unknown error'));
  };
  const read = key => {
    try { return JSON.parse(localStorage.getItem(prefix + key)); }
    catch (error) { report('Could not read the public content cache', error); return null; }
  };
  const write = (key, value) => {
    try { localStorage.setItem(prefix + key, JSON.stringify(value)); }
    catch (error) { report('Could not update the public content cache', error); }
  };
  window.QixarcPublicContent = Object.freeze({ validSlug, report, read, write });
})();
