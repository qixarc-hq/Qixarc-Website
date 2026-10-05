"""Connect generated static pages to the live Supabase CMS."""
from pathlib import Path
import re

def connect(root):
    assets = '''<link rel="stylesheet" href="/cms.css?v=1">
<script src="/assets/supabase-2.117.2.js" defer></script>
<script src="/supabase-config.js" defer></script>
<script src="/database.js" defer></script>
<script src="/site-data.js?v=2" defer></script>'''
    for path in root.rglob('*.html'):
        if path.parent.name in ('admin', 'pricing'):
            continue
        html = path.read_text(encoding='utf-8')
        if '/site-data.js' not in html:
            html = html.replace('</head>', assets + '\n</head>')
        html = re.sub(r'/app.js\?v=[^" ]+', '/app.js?v=admin-forms-1', html)
        html = re.sub(r'/navigation.js\?v=[^" ]+', '/navigation.js?v=admin-cms-1', html)
        html = html.replace('Prepare project enquiry', 'Send project enquiry').replace('Create email draft', 'Send project enquiry')
        html = html.replace('Opens a draft in your email app. You review it before sending.', 'Your details are sent securely to the QIXARC team.')
        html = html.replace('Your email app opens with a draft. Nothing is sent until you send it.', 'Your details are sent securely to the QIXARC team.')
        html = html.replace('<form id="project-form">', '<form id="project-form" method="post">')
        if path.parent.name == 'motion-with-purpose' or path.parent.name == 'post':
            html = re.sub(r'(<main id="main">).*?(</main>)', r'\1<p class="wrap cms-message">Loading article…</p><noscript><p>Enable JavaScript to read the latest published article.</p></noscript>\2', html, flags=re.S)
        if path.parent.name == 'blog':
            html = re.sub(r'<section class="wrap detail-section">.*?</section>', '<section class="wrap detail-section"><p>Loading journal…</p><noscript>Enable JavaScript to read the latest articles.</noscript></section>', html, count=1, flags=re.S)
        if path.parent.name == 'research':
            html = re.sub(r'<section class="wrap detail-section">.*?</section>', '<section class="wrap detail-section"><p>Loading R&amp;D updates…</p><noscript>Enable JavaScript to read the latest updates.</noscript></section>', html, count=1, flags=re.S)
        path.write_text(html, encoding='utf-8')
    source = root / 'blog/motion-with-purpose/index.html'
    target = root / 'blog/post/index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(source.read_text(encoding='utf-8').replace('data-page="blog/motion-with-purpose"', 'data-page="blog/post"'), encoding='utf-8')

if __name__ == '__main__':
    connect(Path(__file__).resolve().parents[1] / 'dist')
