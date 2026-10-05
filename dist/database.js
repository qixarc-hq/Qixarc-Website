(() => {
  const config = window.QIXARC_SUPABASE;
  if (!config || !window.supabase) return;
  window.qixarcDB = window.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, storage: sessionStorage, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'qixarc-admin-session' }
  });
})();
