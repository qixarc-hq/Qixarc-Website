# QIXARC security notes

## Account controls

Open `/admin/`, sign in, and select **Account & security**. Changing a password requires the current password and a matching new passphrase of 12–128 characters. Successful changes lock the dashboard and request global session revocation. The application does not log passwords or persist them in its own storage.

Session controls can lock this browser, sign out other sessions, or sign out all sessions. Supabase refresh-token revocation does not invalidate already issued access tokens immediately: they remain valid until their configured expiry. The 15-minute inactivity lock is enforced by the browser, not a newly configured server-side session lifetime.

## Server-side boundaries

Supabase verifies users. Membership in `qixarc_admins` grants administrative access through database row-level policies. Client UI visibility is not an authorization mechanism.

- All three public tables have row-level security enabled.
- Anonymous visitors may read published content, but not drafts, enquiries or admin membership records.
- Public enquiry inserts are limited to the intended form columns, validated by database constraints, and must use the default new status.
- Only administrators can read enquiries and update their status or write CMS content. The browser has no grant to create admin memberships.
- Browser credentials are stored in session storage. No service-role credential belongs in public assets.
- Vercel supplies a same-origin script policy, restricted connections, anti-framing and MIME protections. Admin pages use no-store and noindex headers.

## Remaining configuration follow-up

The Supabase security advisor reports **Leaked Password Protection Disabled**. It was not enabled by this code change; the connected management tools do not expose that Auth setting. Review **Authentication → Settings → Password security** in the project's Supabase dashboard. Supabase documents leaked-password protection as a Pro-plan-and-above feature; no plan upgrade was performed.

Reference: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Verification

- `node scripts/test-admin-security.mjs` tests password and session failure/success paths using mock authentication only.
- `python scripts/check-public-access.py` makes read-only anonymous requests against the configured backend, without creating enquiries or changing accounts.
- Build and SEO tests: `QIXARC_CMS_OFFLINE=1 python scripts/build-pages.py` and `python scripts/test-seo.py`.

The October 2026 checks are targeted application checks, not a full penetration test or a guarantee against every vulnerability. No live administrator password was changed during verification.
