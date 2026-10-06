# Search publishing workflow

Vercel uses `dist` as the project root with files outside the root included. `dist/vercel.json` fetches only published CMS records, generates HTML, and runs the SEO checks before deployment. A failed CMS fetch or failed check stops the build.

Run from the repository root with Python 3:

```sh
python scripts/export-published.py --fetch
python scripts/build-pages.py
python scripts/test-seo.py
```

Omit the fetch for an offline rebuild using the checked-in public snapshot. Serve `dist` with a static server after generating it. Checked-in HTML may predate generation; the build output is the deployed version.

After publishing, editing, unpublishing or deleting CMS articles, redeploy Vercel so HTML routes and sitemap reflect the current published set. Browser content refreshes from the CMS, but that alone does not regenerate static routes or remove cached article HTML. For urgent removal, unpublish and redeploy together.

Page metadata and schema: `scripts/seo.py`. Visible international service answers: `scripts/search-content.py`. Detail-page templates: `scripts/build-pages.py` and `scripts/product-story.py`. Public content export: `scripts/export-published.py`.

Canonical host: https://www.qixarc.com/. Sitemap: /sitemap.xml. Admin and generic article loader are noindex. The old pricing route permanently redirects to research. Optional /llms.txt is a navigation summary, not a guarantee or requirement for AI search visibility. No special AI-only schema or fabricated reviews are used.

Privacy and terms drafts remain outside this repository pending completed business details and legal review. Broken footer links are removed until approved pages exist. No confidential legal PDF is included.
