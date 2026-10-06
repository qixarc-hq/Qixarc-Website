"""Offline checks for the rendered output and repeatable search metadata."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import re
import runpy
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
BASE = 'https://www.qixarc.com'

class HTML(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.h1=0; self.canonical=[]; self.robots=[]; self.desc=[]; self.links=[]; self.json=[]; self.script=False; self.buffer=''; self.title=''; self.in_title=False; self.images=[]
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='h1': self.h1+=1
        if tag=='title':self.in_title=True
        if tag=='img':self.images.append(a)
        if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
        if tag=='meta' and a.get('name')=='robots':self.robots.append(a.get('content',''))
        if tag=='meta' and a.get('name')=='description':self.desc.append(a.get('content',''))
        if tag=='a':self.links.append(a.get('href',''))
        if tag=='script' and a.get('type')=='application/ld+json':self.script=True;self.buffer=''
    def handle_data(self,data):
        if self.script:self.buffer+=data
        if self.in_title:self.title+=data
    def handle_endtag(self,tag):
        if tag=='script' and self.script:self.json.append(json.loads(self.buffer));self.script=False
        if tag=='title':self.in_title=False

def check():
    sitemap=ET.parse(DIST/'sitemap.xml')
    urls=[e.text for e in sitemap.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    assert len(urls)==len(set(urls)) and len(urls)>=8
    titles=[];descriptions=[];broken=[]
    for url in urls:
        assert url.startswith(BASE+'/')
        path=DIST/urlsplit(url).path.strip('/')/'index.html'
        assert path.exists(),url
        text=path.read_text(encoding='utf-8');page=HTML(text)
        assert page.h1==1,(url,'H1 count',page.h1)
        assert page.canonical==[url],(url,'canonical',page.canonical)
        assert len(page.desc)==1 and page.desc[0],(url,'description')
        assert len(page.robots)==1 and page.robots[0].startswith('index,'),(url,'robots')
        assert page.json,(url,'schema')
        assert all('alt' in image for image in page.images),(url,'image alt')
        titles.append(page.title);descriptions.append(page.desc[0])
        for link in page.links:
            parts=urlsplit(link)
            if parts.netloc and parts.netloc!='www.qixarc.com':continue
            if parts.scheme and parts.scheme not in ('https','http'):continue
            if not parts.path or not parts.path.startswith('/'):continue
            target=DIST/unquote(parts.path).strip('/')
            if not target.is_file() and not (target/'index.html').is_file():broken.append((url,link))
    assert len(titles)==len(set(titles)),'Duplicate titles'
    assert len(descriptions)==len(set(descriptions)),'Duplicate descriptions'
    assert not broken,broken
    for route in ['admin','pricing','blog/post']:
        assert 'noindex' in HTML((DIST/route/'index.html').read_text(encoding='utf-8')).robots[0]
        assert BASE+'/'+route+'/' not in urls
    posts=json.loads((ROOT/'scripts/published-content.json').read_text(encoding='utf-8'))
    for post in posts:
        if post['kind']!='blog':continue
        text=(DIST/'blog'/post['slug']/'index.html').read_text(encoding='utf-8')
        assert 'data-cms-snapshot="published"' in text
        assert post['title'] in text
        page=HTML(text)
        article=[s for s in page.json if s.get('@type')=='BlogPosting']
        assert len(article)==1 and article[0]['datePublished']==post['created_at']
        assert BASE+'/blog/'+post['slug']+'/' in urls
    exporter=runpy.run_path(str(ROOT/'scripts/export-published.py'))
    assert '<script>' not in exporter['body_html']('<script>alert(1)</script>')
    for slug in ['../private', 'post', 'x/y']:
        try:exporter['validate']([{'slug':slug,'kind':'blog','status':'published'}])
        except ValueError:pass
        else:raise AssertionError('Unsafe slug accepted')
    before={str(p):p.read_bytes() for p in DIST.rglob('*') if p.is_file()}
    runpy.run_path(str(ROOT/'scripts/seo.py'))['apply'](DIST)
    after={str(p):p.read_bytes() for p in DIST.rglob('*') if p.is_file()}
    assert before==after,'SEO generation is not idempotent'
    print(f'PASS: {len(urls)} sitemap URLs, unique metadata, H1s, canonicals, JSON-LD, article HTML, noindex exclusions, safe CMS escaping, repeatable generation.')

if __name__=='__main__':check()
