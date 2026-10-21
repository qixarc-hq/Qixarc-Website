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
