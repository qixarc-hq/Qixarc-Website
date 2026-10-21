# Responsive and performance maintenance

## Behavior

- Navigation switches to its accessible mobile menu at 1100px. Content grids collapse for tablets and phones, with wrapping text and touch-sized controls.
- Three.js loads only for eligible desktop devices when the showcase or guide needs it. Mobile, coarse-pointer, reduced-motion, data-saving and low-resource devices use the supplied artwork or CSS mascot.
- Render loops stop when hidden, paused or outside their relevant viewport. Heading reveals use words instead of individual characters, and scroll indicators animate transforms.
- Optimized WebP copies total 156 KB versus 774 KB for the corresponding original images. The originals remain available in `dist/assets`.

## Content and build

- Edit product descriptions, status, features and the Serlow action in `scripts/product-story.py`. Decision Sphere is explicitly coming soon and its capabilities are described as planned.
- `scripts/seo.py` applies shared asset versions, optimized image references and metadata.
- Keep the offline CMS snapshot workflow described in `SEO-PUBLISHING.md`.

```sh
python3 scripts/build-pages.py
python3 scripts/test-seo.py
```

Vercel uses the same commands from the `dist` root, without fetching CMS content during the build.

## Verification

- Ten routes checked at 320, 390, 768, 1024 and 1440px: no horizontal overflow, clipped visible text or browser runtime errors.
- Navigation open/close, Escape/focus restoration and desktop resizing passed.
- Serlow URL and Decision Sphere status, permissions and capability copy passed.
- Mobile and reduced-motion sessions did not request Three.js. Eligible desktop sessions loaded showcase and guide visuals on demand; pause controls worked.
- Contact-form required fields, failure retention and success reset passed with a mocked database client. Live delivery was subsequently verified on 21 October 2026 after restoring the paused Supabase project. The real Contact form, stored record, company-admin access and non-admin isolation passed.
- Offline generation and SEO checks passed for all nine sitemap routes, including repeatable generation.
- Local Lighthouse, Chromium 153, compressed production files: performance **94 mobile / 100 desktop**; accessibility, best practices and SEO **100** on both. Mobile LCP 2.6s, total blocking time 0ms, CLS 0. Desktop LCP 0.6s, blocking time 0ms, CLS 0. These are lab results, not production field measurements.
