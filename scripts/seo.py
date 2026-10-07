"""Apply repeatable SEO metadata to the static deployment output."""
from pathlib import Path
from html import escape
import json
import re

BASE = 'https://www.qixarc.com'
PAGES = {
    '': ('QIXARC | Web Design, Development & Digital Products', 'QIXARC builds business websites, e-commerce experiences and digital products. Based in India and welcoming international clients. Discuss your project.'),
    'story': ('Our Story & QBit | QIXARC', 'Meet QBit, QIXARC’s digital companion, and follow our journey from early ideas to software, AI and automation products.'),
    'products': ('Digital Products: Scaler Profile, Serlow & AI | QIXARC', 'Explore Scaler Profile, Zevaris AI, Serlow and DecisionSphere: QIXARC products for messaging, intelligent assistance, teamwork and decisions.'),
    'services': ('Web Design, Development & UI/UX Services | QIXARC', 'Plan your business website, online store or custom digital system with QIXARC. Explore our services and how we work with international clients.'),
    'about': ('About Our Team | QIXARC, Madurai', 'Meet QIXARC in Madurai and our leadership: Kabibalan, Founder; Sri, Co-founder; and Giri, Managing Director. Explore their portfolios.'),
    'research': ('Research & Development | QIXARC', 'Explore QIXARC’s research into human-guided AI, interfaces in motion and connected workflows, with updates from our R&D desk.'),
    'blog': ('Design & Technology Blog | QIXARC', 'Read QIXARC’s design and technology journal: ideas about useful interfaces, purposeful animation and digital product development.'),
    'contact': ('Contact QIXARC | Discuss Your Digital Project', 'Contact QIXARC in Madurai about websites, UI/UX design and digital products. Send a project enquiry or email qixarc@gmail.com.'),
}

def apply(root):
    root = Path(root)
    posts = json.loads((root.parent / 'scripts/published-content.json').read_text(encoding='utf-8'))
    articles = {'blog/' + p['slug']: p for p in posts if p['kind'] == 'blog' and p['status'] == 'published'}
    pages = dict(PAGES)
    pages.update({route: (post['title'].rstrip('.') + ' | QIXARC Journal', post['summary']) for route, post in articles.items()})
    for path in root.rglob('*.html'):
        route = path.parent.relative_to(root).as_posix()
        if route == '.': route = ''
        html = path.read_text(encoding='utf-8')
        html = re.sub(r'<!-- SEO -->.*?<!-- /SEO -->\s*', '', html, flags=re.S)
        html = re.sub(r'<meta\s+(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>\s*', '', html)
        html = re.sub(r'<link\s+rel="canonical"[^>]*>\s*', '', html)
        if route == 'admin':
            block = '<meta name="robots" content="noindex,nofollow">'
        elif route == 'pricing':
            block = f'<meta name="robots" content="noindex,follow"><link rel="canonical" href="{BASE}/research/">'
        elif route == 'blog/post':
            # The legacy query-based loader stays available for new CMS entries.
            # Unknown/empty slugs must not index a generic or duplicate article.
            block = '<meta name="robots" content="noindex,follow">'
        else:
            title, description = pages.get(route, ('QIXARC', 'Web design, development and digital products from QIXARC.'))
            html = re.sub(r'<title>.*?</title>', f'<title>{escape(title)}</title>', html, flags=re.S)
            url = BASE + ('/' + route + '/' if route else '/')
            block = f'<meta name="description" content="{escape(description, quote=True)}">\n<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">\n'
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
            if route in pages:
                page_type = {'about': 'AboutPage', 'contact': 'ContactPage', 'blog': 'CollectionPage', 'research': 'CollectionPage', 'products': 'CollectionPage'}.get(route, 'WebPage')
                graph.append({'@type': page_type, '@id': url + '#webpage', 'url': url, 'name': title, 'description': description, 'inLanguage': 'en', 'about': {'@id': BASE + '/#organization'}, 'isPartOf': {'@id': BASE + '/#website'}})
                if route:
                    crumbs = [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': BASE + '/'}]
                    if route in articles: crumbs.append({'@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': BASE + '/blog/'})
                    crumbs.append({'@type': 'ListItem', 'position': len(crumbs)+1, 'name': title.split(' | ')[0], 'item': url})
                    graph.append({'@type': 'BreadcrumbList', 'itemListElement': crumbs})
            if route == 'services':
                for slug, name, description in [('web-development', 'Web design and development', 'Responsive business websites with agreed page structure, content and handover.'), ('ecommerce', 'E-commerce development', 'Online store experiences with product information and purchase journeys.'), ('ui-ux', 'UI/UX design', 'User journeys, interface design and interactive prototypes.'), ('digital-systems', 'Custom digital systems', 'Focused business interfaces with agreed roles, data and integrations.')]:
                    graph.append({'@type': 'Service', '@id': url + '#' + slug, 'name': name, 'serviceType': name, 'description': description, 'provider': {'@id': BASE + '/#organization'}, 'url': url})
            block += '<script type="application/ld+json">' + json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('<', '\\u003c') + '</script>'
            if route in articles:
                post = articles[route]
                schema = {'@context': 'https://schema.org', '@type': 'BlogPosting', '@id': url + '#article', 'headline': post['title'], 'description': post['summary'], 'datePublished': post['created_at'], 'dateModified': max(post['created_at'], post['updated_at']), 'inLanguage': 'en', 'mainEntityOfPage': {'@id': url + '#webpage'}, 'author': {'@type': 'Organization', '@id': BASE + '/#organization', 'name': 'QIXARC', 'url': BASE + '/about/'}, 'publisher': {'@id': BASE + '/#organization'}}
                block += '<script id="cms-article-schema" type="application/ld+json">' + json.dumps(schema, ensure_ascii=False).replace('<', '\\u003c') + '</script>'
        html = re.sub(r'/site-data.js\?v=[^" ]+', '/site-data.js?v=seo-4', html)
        if '/site-data.js' in html and '/published-routes.js' not in html:
            html = html.replace('<script src="/site-data.js', '<script src="/published-routes.js" defer></script>\n<script src="/site-data.js')
        # Visible breadcrumbs and fast local fonts help navigation and rendering.
        html = re.sub(r'<!-- BREADCRUMBS -->.*?<!-- /BREADCRUMBS -->', '', html, flags=re.S)
        if route in pages and route:
            trail = '<a href="/">Home</a> / '
            if route in articles: trail += '<a href="/blog/">Blog</a> / '
            trail += '<span aria-current="page">' + escape(pages[route][0].split(' | ')[0]) + '</span>'
            html = re.sub(r'(<main\b[^>]*>)', lambda m: m[1] + '<!-- BREADCRUMBS --><nav class="wrap seo-breadcrumbs" aria-label="Breadcrumb">' + trail + '</nav><!-- /BREADCRUMBS -->', html, count=1)
        if 'href="/seo.css"' not in html: html = html.replace('</head>', '<link rel="stylesheet" href="/seo.css">\n</head>')
        if 'rel="preload"' not in html:
            html = html.replace('</head>', '<link rel="preload" href="/assets/fonts/display.woff2" as="font" type="font/woff2" crossorigin>\n</head>')
        html = html.replace('</head>', '<!-- SEO -->\n' + block + '\n<!-- /SEO -->\n</head>')
        path.write_text(html, encoding='utf-8')
    entries = []
    for route in pages:
        url = BASE + ('/' + route + '/' if route else '/')
        lastmod = '<lastmod>' + max(articles[route]['created_at'], articles[route]['updated_at']) + '</lastmod>' if route in articles else ''
        entries.append(f'  <url><loc>{url}</loc>{lastmod}</url>\n')
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(entries) + '</urlset>\n'
    (root / 'sitemap.xml').write_text(sitemap, encoding='utf-8')
    (root / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n', encoding='utf-8')
    (root / 'llms.txt').write_text('# QIXARC\n\n> Web design, development and digital products. Based in Madurai, India; international project enquiries welcome.\n\n## Official pages\n' + ''.join(f'- [{title.split(" | ")[0]}]({BASE}{"/"+route+"/" if route else "/"}): {description}\n' for route, (title, description) in pages.items()) + '\n## Contact\n- Email: qixarc@gmail.com\n- Phone: +91 83007 15081\n\n## Product status\nScaler Profile: development / early access. Zevaris AI: coming soon. Serlow: active development. DecisionSphere: prototype / in development.\n\nThis is an optional navigation summary. The linked HTML pages are the authoritative source.\n', encoding='utf-8')

if __name__ == '__main__':
    apply(Path(__file__).resolve().parents[1] / 'dist')
