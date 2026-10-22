# QIXARC interaction update — 21 October 2026

The public site now includes a short first-visit logo loader, resource-readiness progress, a dark scroll indicator, contextual button treatments, logo feedback, service artwork and linked capability pages. The studio artwork and principle cards link to the About page. The footer links to Terms, Privacy and Cookies pages generated from the shared content module.

Qbit blinks, offers a dismissible “Any help, mate?” nudge after 30 seconds without activity, and provides page shortcuts. The nudge appears once per tab and waits while a form field, menu or guide is active. Qbit remains a local website guide. It does not call an AI service. Pause controls and scroll-to-explore/back-to-top buttons are removed. Device reduced-motion preferences remain supported.

FAQ answers reveal on scrolling and open/close by pointer or keyboard with an animated plus/minus icon. A manually closed answer stays under the visitor’s control. The height animation is limited to the active FAQ item; decorative effects use transform and opacity.

## Editable source

- `scripts/experience-content.py`: capabilities, detail pages, policies and landing-page cards.
- `dist/experience.css`: responsive type, cards, navigation, footer and interaction treatments.
- `dist/experience.js`: loading progress, section-number formatting, logo feedback and FAQ interaction.
- `dist/guide.js`: guide shortcuts and idle prompt.
- `dist/comets.js`: 24 desktop / 5 phone shooting-star elements; animation stops off-screen, in a hidden tab or with reduced motion.

Images are lazy-loaded WebP files, with 540px card variants. The new interaction stylesheet and script together total approximately 6.9 KB compressed. Rich 3D remains lazy and desktop-only and now checks WebGL support before requesting the engine.

## Validation

- Production generation and SEO checks pass for 16 sitemap routes, with unique metadata, canonicals, JSON-LD, published article snapshots and excluded admin/legacy routes.
- Internal asset, route and anchor checks pass on all 16 public pages. Removed controls are absent.
- Browser layout checks pass on 15 pages at 320, 375, 760, 1024 and 1280px frame widths: 75 combinations, no horizontal overflow. These are viewport layout checks, not physical-device tests.
- Browser interaction checks cover mobile menu opening/Escape, service-card navigation, FAQ pointer/keyboard handling, Qbit panel and idle invitation.
- The preview browser has no WebGL renderer; the lightweight fallback was verified. Actual GPU rendering was not re-tested here.
- No new Lighthouse score is claimed for this release. Previous Lighthouse results in PERFORMANCE.md describe the earlier release.
- Supabase configuration, database, permissions and enquiry submission logic remain as previously deployed; the form helper now links to Privacy. No additional live enquiry was sent during this visual update.

## Artwork

The four capability illustrations and studio image are conceptual marketing artwork, not client work or photographs of QIXARC’s office. Asset paths: `dist/assets/service-{design,web,commerce,systems}.webp` and `dist/assets/studio-concept.webp`, with corresponding `-540.webp` versions.

The digital-systems image was created with the built-in image-generation tool during this release, using this prompt:

> Use case: stylized-concept. Asset type: a service card image for QIXARC's digital systems capability. Create a premium editorial 3D still life of modular translucent cobalt blue glass blocks and matte near-black components connected by delicate silver rails, evoking a clear connected workflow. Off-white studio background, softly lit, realistic glass and anodized metal, clean minimal composition with generous breathing room, landscape 3:2. No text, no labels, no logos, no watermark. This should fit alongside blue product design and web development illustrations on a professional technology studio website.

## Second visual pass — 21 October 2026

The first-visit logo introduction now runs for three seconds (plus a short fade), with a timed introduction bar. The website scroll-position bar and page-curtain line are removed. Existing tabs receive the new introduction once via a versioned session key. Reduced-motion and keyboard dismissal remain available.

Section 04 uses new collaboration concept artwork. Its image has an explicit 3:2 frame, and inherited font, positioning and spinning-arrow rules are reset within the studio card. Names and card headings use bold Space Grotesk, with a distinct mono treatment for numbers and labels. Display headings retain Anton with more restrained sizes and spacing.

Nine new generated illustrations cover studio/about, products, story, research, journal/article, contact, terms, privacy and cookies. Each is supplied as 900px and 540px WebP assets. Services retain their four existing generated illustrations. All 16 public sitemap pages contain relevant imagery. Prompt provenance and asset paths are in scripts/artwork-prompts.json. These are concept illustrations, not photographs of staff or an office.

Cards now rise and tilt with a fine pointer and have entrance/tap feedback. Touch layouts avoid pointer tilt. Shooting stars use 40 elements per desktop field and 9 per phone field, on the homepage hero, introduction and studio section, and detail-page heroes. Only visible fields animate; hidden tabs and reduced-motion devices stop decorative motion.

Build and SEO checks pass for 16 sitemap routes. All 16 public pages pass asset/link/anchor checks and contain no scroll-progress element. Browser frame layouts were checked at 320, 375, 760, 1024 and 1280px (80 combinations, no horizontal overflow). No physical-device or fresh Lighthouse result is claimed. The existing Story biography and enquiry submission logic are unchanged.


## Orbital reference refinement — 21 October 2026

- Recreated the supplied loading reference as live CSS/DOM: blue ambient light, orbital rings, metallic QIXARC logo, floating cards and percentage progress. The intro runs for 2,000 ms plus a 220 ms fade, once per tab under `qixarc-intro-v3`. Pointer movement tilts the composition and a tap gives brief scale feedback. Reduced motion skips it; any key dismisses it. No screenshot-sized raster asset or new rendering dependency is required.
- Matched the supplied landing reference with blue lighting arcs, maintained the existing brand fonts, increased supporting-copy weight, and refined section 01 label, number, heading and statistics spacing.
- Only the first FAQ opens when scrolled into view. Remaining questions require a click or keyboard activation; answers and plus/minus states retain smooth transitions.
- Selected navigation is black with white text, including parent Services on service detail pages. Shared controls transition to black/white on hover, focus and press. Mobile hero button fill is contained within its own hit target.
- The top-left logo moves left and returns on click before navigating home. Ambient hero layers pause offscreen and when the page is hidden. Existing coarse-pointer and reduced-motion policies remain.
- Verification: Python build/SEO suite passed for all 16 sitemap pages; JS syntax and whitespace checks passed. Browser verified FAQ first-only automatic opening and manual opening/closing, black selected menu states on desktop/mobile, and logo navigation from a service page. 20 representative viewport/route combinations (320, 375, 760, 1024, 1280 px across home, service detail, contact, privacy) showed no horizontal overflow. Desktop and phone-sized orbital/hero layouts were visually inspected. These are browser viewport checks, not physical-device or fresh Lighthouse measurements.


## Phone and tablet refinement — 21 October 2026

- Added a final responsive layer for compact phones through tablet and landscape layouts, including 240 px CSS viewports. Content widths, not physical screen diagonals, determine the layout. Product overview cards use two columns from 360 px; very narrow screens keep one readable column. Capability cards use two columns from 560 px. Detail pages, headings, footer, forms, logos and controls receive compact sizing and wrapping rules.
- Mobile navigation now centers links on a viewport-filling tinted frosted background below the top bar. Short landscape viewports use two menu columns. Active links remain black/white, focus is blue/white, menu items have at least 44 px tap targets, Escape restores page access, and the background remains inert while open.
- Shooting-star pools reduced from 9/40 to 3/7 (phone/desktop), with shorter travel and shorter respawn intervals. Cursor sparkles use eight reused DOM nodes, 70 ms throttling and 420 ms lifetimes, and run only with a fine mouse pointer; touch, reduced motion and data-saving preferences disable them. Logo click feedback reduced to 3 px/3% for 180 ms.
- Moved the intro into a small script at the start of the body so it does not wait behind deferred application/database scripts. The logo is preloaded. A 2-second intro exits with a 320 ms dissolve and 600 ms main-content fade; emergency dismissal remains bounded. Session key is qixarc-intro-v4. Page-header concept illustrations are eager/high priority; lower images retain native lazy loading and intrinsic dimensions.
- Validation: build and SEO checks for 16 sitemap routes; JS syntax and diff checks; all local image sources exist and have dimensions. Browser audit covered 16 public routes at 240, 360, 768 and 1024 px. Two narrow service-heading clips were fixed and both affected routes rechecked clean. Verified 390 px two-column product images load on scroll, centered 390 px menu, 640×360 landscape menu with all seven 44 px links, Escape/inert restoration, and loader removal with main opacity restored to 1. No site errors observed (browser-extension metadata errors excluded). These are Chromium viewport checks, not a claim of testing every physical phone or browser.

## Mobile CTA and admin security — 22 October 2026

- Fixed the clipped homepage product button by resetting the inherited desktop `left: 50%` offset in the mobile layout. Button text and hit target now stay within the viewport. Retained the responsive spacing work without the experimental database-loader or parallax changes; no new PageSpeed score is claimed.
- Added Account & security to the admin dashboard, with current-password verification, a confirmed 12–128-character new password, sign-out after a successful change, session locking, and separate controls for other/all sessions. Password fields are cleared after submission. Admin membership is rechecked before sensitive mutations.
- Added a 15-minute dashboard inactivity lock, clearing rendered private data on sign-out, expiry and page exit. This is a browser convenience safeguard; Supabase authentication and row-level security remain the server-side authorization boundary.
- Added a restrictive script/content policy, anti-framing, MIME sniffing protection, permission restrictions, and no-store/noindex headers for admin routes.
- Validation: browser bounds checks passed at 240, 280, 320, 360, 390, 430, 768, 1024 and 1440 px for the hero CTA, security controls and sign-in form. Simulated-account UI checks verified other-session sign-out preserves the current dashboard and inactivity clears it. Password helper tests cover validation, expired/non-admin sessions, current-password failure, revoked membership, failed updates and sign-out scopes. No live account password was changed.
- Read-only production API checks confirmed anonymous users cannot read enquiries or admin records, cannot see drafts, and can still read published content. Database audit confirmed RLS and restricted column grants. Supabase's remaining security advisory is disabled leaked-password protection; see SECURITY.md for the configuration follow-up and session limitations.

## Mobile showcase logo fit — 22 October 2026

The existing logo artwork now sits in a proportional, contained area below the showcase copy on phones, with a 360 px maximum width and space above the footer. The rule also covers coarse-pointer screens through 1100 px for touch landscape/tablet layouts. Mobile hover/tap feedback uses a small transform with a 500 ms eased transition; reduced motion skips it. Desktop artwork, type, 3D rendering and settings are unchanged.

Browser checks verified the complete logo stays clear of the text and footer without horizontal overflow at 240, 280, 320, 360, 390, 430, 560, 640 and 760 px frame widths. Computed showcase styles matched the pre-change desktop baseline at 768, 1024, 1280 and 1440 px. Hover reached the expected 0.98 scale / −3 px translation. These are browser viewport checks, not physical-device tests.
