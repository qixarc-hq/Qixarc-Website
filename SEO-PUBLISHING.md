# Search publishing workflow

Vercel uses `dist` as the project root with files outside the root included. `dist/vercel.json` generates HTML from the checked-in public content snapshot and runs the SEO checks before deployment. Builds do not require a live CMS connection. A failed generation or SEO check stops the build.

Run from the repository root with Python 3:

```sh
python scripts/export-published.py --fetch
python scripts/build-pages.py
python scripts/test-seo.py
```

Omit the fetch for an offline rebuild using the checked-in public snapshot. Serve `dist` with a static server after generating it. Checked-in HTML may predate generation; the build output is the deployed version.

After publishing, editing, unpublishing or deleting CMS articles, run the fetch, generation, and test commands above, then commit the updated snapshot and generated files and deploy. Redeploying the same commit uses the same snapshot; it does not fetch newer CMS records. This ensures HTML routes and the sitemap reflect the reviewed published set. Browser content refreshes from the CMS, but that alone does not regenerate static routes or remove cached article HTML. For urgent removal, unpublish, refresh and commit the snapshot, and deploy together.

Page metadata and schema: `scripts/seo.py`. Visible international service answers: `scripts/search-content.py`. Detail-page templates: `scripts/build-pages.py` and `scripts/product-story.py`. Public content export: `scripts/export-published.py`.

Canonical host: https://www.qixarc.com/. Sitemap: /sitemap.xml. Admin and generic article loader are noindex. The old pricing route permanently redirects to research. Optional /llms.txt is a navigation summary, not a guarantee or requirement for AI search visibility. No special AI-only schema or fabricated reviews are used.

## Retired URLs

Search Console's 404 report inspected on 22 October 2026 listed `/demo` and
`/why-qixarc` (last crawled 15 October). These pre-redesign URLs now permanently
redirect at the server to the current product showcase and company page.
The earlier link audit also records the retired privacy and terms URLs.

| Retired path (with or without trailing slash) | Current destination |
| --- | --- |
| `/demo` | `/products/` |
| `/why-qixarc` | `/about/` |
| `/privacy-policy` | `/privacy/` |
| `/terms-of-service` | `/terms/` |
| `/pricing` | `/research/` |

`dist/vercel.json` owns these explicit permanent redirects. The sitemap and
internal links use the destination URLs. Unknown URLs still return 404; do not
redirect all missing pages to the homepage. The SEO build check verifies that
redirects lead directly to indexable sitemap pages without chains or loops.

After deployment, verify both trailing-slash variants return a permanent redirect
and the destination returns 200. Then select **Validate fix** in the Search
Console 404 report. Google updates the report after it recrawls; a deployment
does not immediately clear the historical warning.
