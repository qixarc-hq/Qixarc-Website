(() => {
  const config = window.QIXARC_SUPABASE;
  if (!config || !window.supabase) return;
  window.qixarcDB = window.supabase.createClient(config.url, config.publishableKey, {
    global: { fetch: (resource, options) => {
      const method = (options?.method || resource?.method || 'GET').toUpperCase();
      const url = new URL(resource?.url || resource);
      if (method === 'GET' && url.pathname.startsWith('/rest/v1/')) {
        return fetch(resource, { ...options, cache: 'no-store' });
      }
      return fetch(resource, options);
    } },
    auth: { persistSession: true, storage: sessionStorage, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'qixarc-admin-session' }
  });
})();
