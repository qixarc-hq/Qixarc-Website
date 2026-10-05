# QIXARC

A complete static company website with Three.js 0.180.0, modern CSS, and the Web Animations API. No build step is required. Supabase provides authentication, form storage and managed Blog/R&D content.

## Dedicated pages (October 2026)

Story now follows Home in the navbar. `/story/` provides five QBit-narrated
chapters with chapter selection and animation controls. The landing page and
`/products/` include Scaler Profile, Zevaris AI, Serlow and DecisionSphere.
Their copy and development statuses are based on Kabibalan's portfolio:
https://kabibalansportfolio.vercel.app/. Edit this content in
`scripts/product-story.py`, then regenerate with `scripts/build-pages.py`.

`dist/about-motion.js` adds pointer-responsive tilt to the brand cards;
the three landing-page values use a bottom-up hover fill inspired by the
portfolio's service rows. Motion respects reduced-motion preferences.

The fixed glass navbar links to `/`, `/products/`, `/services/`, `/about/`,
`/research/`, `/blog/` and `/contact/`. The full blog article lives at
`/blog/motion-with-purpose/`. The old `/pricing/` URL redirects to R&D;
the homepage pricing section has been removed.
Each detail route has an `index.html`, so direct
navigation and refresh work with the existing Python static server.
Detail pages use new copy rather than duplicating landing sections.

`dist/pages.css` contains the shared Scaler Profile typography and detail-page
layouts. `dist/navigation.js` provides the signature vertical page curtain,
reduced-motion handling, and automatic header-height offsets. Fonts are local.

Edit detail-page content in `scripts/build-pages.py`, then run
`python scripts/build-pages.py` to regenerate its shared page shells. The
generated HTML is served directly; regeneration is only needed after template edits.

## Contents

- `dist/index.html`: semantic page content, navigation, service tabs, projects, FAQs, and enquiry form.
- `dist/style.css`: responsive layouts, Agero-inspired typography and palette, motion preferences, and mobile navigation.
- `dist/app.js`: accessible interactions, Supabase enquiry submissions, scroll reveals, and motion controls.
- `dist/scene.js`: locally bundled Three.js scenes with pointer response, lighting, reduced-motion support, visibility handling, and non-WebGL fallbacks.
- `dist/assets`: QIXARC's original demo cover images, a custom favicon, and the Three.js runtime with its license.

Serve `dist` with any static HTTP server. For a local read-only preview, run `python -m http.server 8000 --directory dist` and visit http://localhost:8000.

## Content provenance

Company positioning, main service starting prices, business statistics, demo names and links, and contact information were read from https://www.qixarc.com on 2 October 2026. Demo cards are explicitly presented as concepts and prototypes. The current homepage lists Portfolio ₹4,000, Static ₹8,000, E-commerce ₹15,000, and Dynamic ₹18,000; the detailed calculator has additional portfolio packages, including a ₹2,000 beginner package. The redesign preserves the homepage starting prices and links to the detailed calculator.

Visual direction references https://agero.framer.website/: light canvas, QIXARC blue accents, large editorial typography, rounded showcases, service tabs, pricing, FAQs, and prominent contact/footer treatments. Text and 3D graphics were created for QIXARC. No Agero testimonials, awards, or client results are reused.

## Admin and Supabase

Project: QIXARC Website (`iosmotdjsrwuktpzrxvu`), Mumbai, in the `qixarc` organization (`cqviklzkjhbzihoyxovo`).
The project was transferred from the previous organization. Its project reference,
API URL and website configuration remain unchanged. Admin email: `qixarc@gmail.com`.
Project creation was quoted by Supabase at $0/month. Normal plan limits still apply.

Click the bottom-right QBit seven times, with no gap longer than three seconds,
to open `/admin/`. Username: `user`. The Supabase Auth account belongs to
`qixarc@gmail.com`; the initial password was supplied by the owner and is not
stored in the public source code. The shortcut is navigation, not authorization.

- Enquiries: both homepage and Contact forms insert into `qixarc_enquiries`.
  Admins can read and mark them new, read or archived. Visitors cannot read them.
- Blog and R&D: add entries, edit text, save drafts, publish or unpublish.
  Public pages only request published entries from `qixarc_content`.
- Admin membership: `qixarc_admins` authorizes specific Auth user IDs using RLS.
  Other authenticated accounts receive no admin access.
- Sessions use sessionStorage and Supabase refresh tokens. Sign out on shared devices.
- Only the publishable key is in `dist/supabase-config.js`. Never add service keys
  or passwords to `dist`. The one-time account setup Edge Function is disabled (410).
- Content bodies are rendered as text, with `##` headings and blank-line paragraphs;
  arbitrary HTML is not accepted or rendered.

The forms now store enquiries rather than opening email drafts. They show success
only after Supabase confirms insertion and preserve input on failure. Internet
access is required for submissions, login and managed content.

`python scripts/build-pages.py` regenerates static pages and runs `connect-cms.py`
automatically. `scripts/supabase-schema.sql` documents the deployed schema;
Supabase migration history contains the applied migrations. `scripts/cms-seed.json`
is the initial content snapshot; editing it does not overwrite live admin changes.
The pinned browser SDK is @supabase/supabase-js 2.117.2.

Verification completed: login/logout, seven-click entry, public form submission,
admin inbox and CMS save, anonymous enquiry-read denial, real draft isolation,
non-admin access denial, and public publishing denial. Temporary test rows removed.
`scripts/verify-supabase.py` rechecks API access but creates a marked test enquiry;
remove that test row after rerunning.

Supabase Security Advisor reports no table/RLS findings. It reports leaked-password
protection disabled. See https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
for the project-level setting and plan availability.

## Hosting

SEO uses `https://www.qixarc.com` as the production origin. `scripts/seo.py`
generates unique titles/descriptions, canonical URLs, social metadata,
Organization/WebSite/WebPage/breadcrumb structured data, `robots.txt` and
`sitemap.xml`. Page regeneration runs it automatically. Admin and the legacy
pricing redirect are excluded from indexing and from the sitemap.

Published Blog articles update their metadata and BlogPosting structured data
after loading from Supabase. These CMS pages currently require JavaScript;
social preview crawlers that do not execute JavaScript receive generic article
metadata. Per-article previews for new posts require server rendering or a
publish-time export. The sitemap lists the main public routes; new articles
are discoverable through links on Blog. After deploying to the production
domain, submit `/sitemap.xml` through the domain's Google Search Console account.

Publish `dist` as the static document root. No build step is required. The hosting
provider must serve directory `index.html` files for routes such as `/admin/`,
`/blog/` and `/research/`. Supabase remains the hosted backend in the `qixarc`
organization. Connecting the production domain is a separate hosting step.

## QIXARC blue palette update

Imported the brand palette from the existing QIXARC public stylesheet (`index-BfNLJmC8.css`): primary #3B82F6, deep blue #2563EB, darker blue #1D4ED8, and near-black #0B0F14. Applied it to accents, buttons, 3D materials and lighting, service panels, project cards, pricing, contact, and favicon. The light Agero-inspired layout is preserved.

## Run on your Windows computer

Replace the existing dist folder in C:\Users\Giri\Desktop\QIXARC-Website with the updated dist folder. Open Command Prompt and run:

```bat
cd /d "C:\Users\Giri\Desktop\QIXARC-Website"
py -m http.server 8000 --directory dist
```

Visit http://localhost:8000 and press Ctrl+F5 to reload the new palette. If `py` is unavailable, use `python` instead. The JavaScript modules require an HTTP server rather than opening index.html directly.
