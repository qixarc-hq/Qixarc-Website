"""Export public CMS content to HTML. No admin credentials or draft content are used.

Run with --fetch before publishing CMS changes, then run build-pages.py.
The checked-in snapshot supports deterministic, offline rebuilds.
"""
from pathlib import Path
from html import escape
import json
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / 'scripts/published-content.json'

def fetch():
    config = (ROOT / 'dist/supabase-config.js').read_text(encoding='utf-8')
    origin = re.search(r"url: '([^']+)'", config)[1]
    key = re.search(r"publishableKey: '([^']+)'", config)[1]
    fields = 'kind,slug,title,summary,body,created_at,updated_at,status'
    request = urllib.request.Request(origin + '/rest/v1/qixarc_content?select=' + fields + '&status=eq.published&order=created_at.desc', headers={'apikey': key})
    with urllib.request.urlopen(request, timeout=30) as response:
        posts = json.load(response)
    validate(posts)
    SNAPSHOT.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Exported {len(posts)} published CMS records.')

def validate(posts):
    for post in posts:
        if post.get('status') != 'published' or post.get('kind') not in ('blog', 'research'):
            raise ValueError('Snapshot must contain only published blog/research records')
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', post['slug']) or post['slug'] == 'post':
            raise ValueError('Unsafe or reserved article slug')

def body_html(body):
    blocks = []
    for block in re.split(r'\n\s*\n', body):
        if block.startswith('## '):
            heading, _, block = block.partition('\n')
            blocks.append('<h2>' + escape(heading[3:]) + '</h2>')
        if block.strip():
            lines = block.strip().splitlines()
            if all(line.startswith(('• ', '- ')) for line in lines):
                blocks.append('<ul>' + ''.join('<li>' + escape(line[2:]) + '</li>' for line in lines) + '</ul>')
            else:
                blocks.append('<p>' + escape(block).replace('\n', '<br>') + '</p>')
    return ''.join(blocks)

def apply(root):
    root = Path(root)
    posts = json.loads(SNAPSHOT.read_text(encoding='utf-8'))
    validate(posts)
    blog = [p for p in posts if p['kind'] == 'blog']
    template = (root / 'blog/post/index.html').read_text(encoding='utf-8')
    # Remove only previously generated routes no longer published, inside dist/blog.
    published = {p['slug'] for p in blog}
    for path in (root / 'blog').glob('*/index.html'):
        if path.parent.name != 'post' and path.parent.name not in published:
            old = path.read_text(encoding='utf-8')
            if 'data-cms-snapshot="published"' in old or path.parent.name == 'motion-with-purpose':
                path.unlink()
    for post in blog:
        slug = post['slug']
        main = ('<main id="main" class="wrap cms-content" data-cms-snapshot="published">'
                '<a class="text-link" href="/blog/">← All articles</a>'
                '<article><h1>' + escape(post['title']) + '</h1>'
                '<p class="detail-lead">' + escape(post['summary']) + '</p>'
                '<p class="article-byline">By <a href="/about/">QIXARC</a> · Published '
                '<time datetime="' + escape(post['created_at'], quote=True) + '">' + post['created_at'][:10] + '</time></p>'
                '<div class="cms-article-body">' + body_html(post['body']) + '</div></article></main>')
        html = re.sub(r'<main\b.*?</main>', lambda _: main, template, flags=re.S)
        html = html.replace('data-page="blog/post"', f'data-page="blog/{slug}"')
        folder = root / 'blog' / slug
        folder.mkdir(parents=True, exist_ok=True)
        (folder / 'index.html').write_text(html, encoding='utf-8')
    for kind in ('blog', 'research'):
        entries = [p for p in posts if p['kind'] == kind]
        cards = []
        for post in entries:
            content = '<article class="cms-card" id="research-' + post['slug'] + '"><h2>' + escape(post['title']) + '</h2><p>' + escape(post['summary']) + '</p>'
            if kind == 'blog':
                content += '<a class="text-link" href="/blog/' + post['slug'] + '/">Read article: ' + escape(post['title']) + ' ↗</a>'
            else:
                content += '<div class="cms-research-body">' + body_html(post['body']) + '</div>'
            cards.append(content + '</article>')
        section = '<section class="wrap detail-section cms-content" data-cms-snapshot="published">'
        if kind == 'research': section += '<h2>From the R&amp;D desk.</h2>'
        section += '<div class="cms-grid">' + ''.join(cards) + '</div></section>'
        path = root / kind / 'index.html'
        html = path.read_text(encoding='utf-8')
        html = re.sub(r'<section class="wrap detail-section[^\"]*"[^>]*>.*?</section>', lambda _: section, html, count=1, flags=re.S)
        path.write_text(html, encoding='utf-8')
    (root / 'published-routes.js').write_text('window.QIXARC_PUBLISHED_SLUGS = Object.freeze(' + json.dumps(sorted(published)) + ');\n', encoding='utf-8')

if __name__ == '__main__':
    import sys
    if '--fetch' in sys.argv: fetch()
    else: apply(ROOT / 'dist')
