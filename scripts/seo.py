"""Apply repeatable SEO metadata to the static deployment output."""
from pathlib import Path
from html import escape
import json
import re

BASE = 'https://www.qixarc.com'
PAGES = {
    '': ('QIXARC | Web Development & UI/UX Design in Madurai', 'QIXARC builds websites, e-commerce stores and digital products in Madurai. Explore our services, meet our team and discuss your next project.'),
    'story': ('Our Story & QBit | QIXARC', 'Meet QBit, QIXARC’s digital companion, and follow our journey from early ideas to software, AI and automation products.'),
    'products': ('Digital Products: Scaler Profile, Serlow & AI | QIXARC', 'Explore Scaler Profile, Zevaris AI, Serlow and DecisionSphere: QIXARC products for messaging, intelligent assistance, teamwork and decisions.'),
    'services': ('Web Development, E-commerce & UI/UX Services | QIXARC', 'Build websites, e-commerce experiences and digital systems with QIXARC. Explore our design, development and project delivery services.'),
    'about': ('About Our Team | QIXARC, Madurai', 'Meet QIXARC in Madurai and our leadership: Kabibalan, Founder; Sri, Co-founder; and Giri, Managing Director. Explore their portfolios.'),
    'research': ('Research & Development | QIXARC', 'Explore QIXARC’s research into human-guided AI, interfaces in motion and connected workflows, with updates from our R&D desk.'),
    'blog': ('Design & Technology Blog | QIXARC', 'Read QIXARC’s design and technology journal: ideas about useful interfaces, purposeful animation and digital product development.'),
    'contact': ('Contact QIXARC | Discuss Your Digital Project', 'Contact QIXARC in Madurai about websites, UI/UX design and digital products. Send a project enquiry or email qixarc@gmail.com.'),
}

def apply(root):
    root = Path(root)
    for path in root.rglob('*.html'):
        route = path.parent.relative_to(root).as_posix().replace('.', '')
        html = path.read_text(encoding='utf-8')
        html = re.sub(r'<!-- SEO -->.*?<!-- /SEO -->\s*', '', html, flags=re.S)
        html = re.sub(r'<meta\s+(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>\s*', '', html)
        html = re.sub(r'<link\s+rel="canonical"[^>]*>\s*', '', html)
        if route == 'admin':
            block = '<meta name="robots" content="noindex,nofollow">'
        elif route == 'pricing':
            block = f'<meta name="robots" content="noindex,follow"><link rel="canonical" href="{BASE}/research/">'
        else:
            title, description = PAGES.get(route, ('Article | QIXARC Journal', 'Read a design and technology article from the QIXARC journal.'))
            if route == 'blog/motion-with-purpose':
                title = 'Motion Should Have a Purpose | QIXARC Journal'
                description = 'A QIXARC design note on purposeful page transitions, clear feedback and accessible animation for people who prefer reduced motion.'
            html = re.sub(r'<title>.*?</title>', f'<title>{escape(title)}</title>', html, flags=re.S)
            url = BASE + ('/' + route + '/' if route else '/')
            block = f'<meta name="description" content="{escape(description, quote=True)}">\n<meta name="robots" content="index,follow,max-image-preview:large">\n'
            # Query-based articles receive their canonical from the published CMS record.
            if route != 'blog/post':
                block += f'<link rel="canonical" href="{url}">\n'
            for prop, value in [('title', title), ('description', description), ('type', 'article' if route.startswith('blog/') else 'website'), ('site_name', 'QIXARC'), ('locale', 'en_IN'), ('image', BASE + '/assets/qixarc-logo.webp'), ('image:alt', 'QIXARC blue and purple logo')]:
                block += f'<meta property="og:{prop}" content="{escape(value, quote=True)}">\n'
            if route != 'blog/post':
                block += f'<meta property="og:url" content="{url}">\n'
            for name, value in [('card', 'summary'), ('title', title), ('description', description), ('image', BASE + '/assets/qixarc-logo.webp'), ('image:alt', 'QIXARC logo')]:
                block += f'<meta name="twitter:{name}" content="{escape(value, quote=True)}">\n'
            organization = {'@type': 'Organization', '@id': BASE + '/#organization', 'name': 'QIXARC', 'url': BASE + '/', 'logo': BASE + '/assets/qixarc-logo.webp', 'email': 'qixarc@gmail.com', 'telephone': '+91-83007-15081', 'address': {'@type': 'PostalAddress', 'addressLocality': 'Madurai', 'addressRegion': 'Tamil Nadu', 'addressCountry': 'IN'}, 'sameAs': ['https://www.linkedin.com/in/qixarc-%E2%80%8E-27751b3ba', 'https://www.instagram.com/qixarc', 'https://x.com/QIXARC']}
            graph = [organization, {'@type': 'WebSite', '@id': BASE + '/#website', 'url': BASE + '/', 'name': 'QIXARC', 'publisher': {'@id': BASE + '/#organization'}}]
            if route in PAGES:
                graph.append({'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': title, 'description': description, 'isPartOf': {'@id': BASE + '/#website'}})
                if route:
                    graph.append({'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': BASE + '/'}, {'@type': 'ListItem', 'position': 2, 'name': title.split(' | ')[0], 'item': url}]})
            block += '<script type="application/ld+json">' + json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('<', '\\u003c') + '</script>'
        html = html.replace('</head>', '<!-- SEO -->\n' + block + '\n<!-- /SEO -->\n</head>')
        html = html.replace('/site-data.js?v=2', '/site-data.js?v=seo-3')
        path.write_text(html, encoding='utf-8')
    urls = [BASE + ('/' + route + '/' if route else '/') for route in PAGES]
    # Live CMS articles are discovered through crawlable links on the Blog page.
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{url}</loc></url>\n' for url in urls) + '</urlset>\n'
    (root / 'sitemap.xml').write_text(sitemap, encoding='utf-8')
    (root / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n', encoding='utf-8')

if __name__ == '__main__':
    apply(Path(__file__).resolve().parents[1] / 'dist')
