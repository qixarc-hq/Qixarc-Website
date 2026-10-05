(() => {
  const db = window.qixarcDB;
  const launcher = document.querySelector('#qbit-launcher');
  let clicks = 0, lastClick = 0;
  launcher?.addEventListener('click', event => {
    const now = Date.now(); clicks = now - lastClick > 3000 ? 1 : clicks + 1; lastClick = now;
    if (clicks === 7) { event.preventDefault(); event.stopImmediatePropagation(); location.assign('/admin/'); }
  }, true);
  const create = (tag, text, className) => { const e = document.createElement(tag); e.textContent = text; if (className) e.className = className; return e; };
  const renderBody = (parent, body) => {
    body.split(/\n\s*\n/).forEach(block => {
      if (block.startsWith('## ')) {
        const [heading, ...lines] = block.split('\n');
        parent.append(create('h2', heading.slice(3)));
        block = lines.join('\n').trim();
      }
      if (block) {
        const node = create('p', block);
        node.style.whiteSpace = 'pre-line';
        parent.append(node);
      }
    });
  };
  const page = document.body.dataset.page || '';
  if (page !== 'blog' && !page.startsWith('blog/') && page !== 'research') return;
  const article = page.startsWith('blog/');
  const kind = page === 'research' ? 'research' : 'blog';
  const slug = new URLSearchParams(location.search).get('slug') || 'motion-with-purpose';
  const target = article ? document.querySelector('main') : document.querySelector('main .detail-section');
  if (!target) return;
  target.classList.add('cms-content');
  if (article) target.classList.add('wrap');
  const load = async () => {
    target.replaceChildren(create('p', 'Loading…', 'cms-message'));
    if (!db) { failed(); return; }
    let query = db.from('qixarc_content').select('id,slug,title,summary,body,created_at').eq('kind', kind).eq('status', 'published').order('created_at', { ascending: false });
    if (article) query = query.eq('slug', slug).limit(1);
    else query = query.limit(100);
    try {
      const { data, error } = await query;
      if (error) { failed(); return; }
      target.replaceChildren();
      if (article) {
        const back = create('a', '← All articles', 'text-link'); back.href = '/blog/'; target.append(back);
        if (!data.length) {
          document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex,follow');
          target.append(create('h1', 'Article unavailable.'), create('p', 'This article is not currently published.')); return;
        }
        const post = data[0]; document.title = `${post.title} | QIXARC`;
        const meta = document.querySelector('meta[name=description]'); if (meta) meta.content = post.summary;
        const articleUrl = post.slug === 'motion-with-purpose' ? 'https://www.qixarc.com/blog/motion-with-purpose/' : `https://www.qixarc.com/blog/post/?slug=${encodeURIComponent(post.slug)}`;
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
        canonical.href = articleUrl;
        const setMeta = (attribute, name, value) => {
          let tag = document.querySelector(`meta[${attribute}="${name}"]`);
          if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attribute, name); document.head.append(tag); }
          tag.content = value;
        };
        setMeta('property', 'og:title', document.title);
        setMeta('property', 'og:description', post.summary);
        setMeta('property', 'og:url', articleUrl);
        setMeta('name', 'twitter:title', document.title);
        setMeta('name', 'twitter:description', post.summary);
        document.querySelector('#cms-article-schema')?.remove();
        const schema = document.createElement('script'); schema.type = 'application/ld+json'; schema.id = 'cms-article-schema';
        schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.summary, datePublished: post.created_at, mainEntityOfPage: articleUrl, author: { '@type': 'Organization', name: 'QIXARC', url: 'https://www.qixarc.com/' }, publisher: { '@id': 'https://www.qixarc.com/#organization' } });
        document.head.append(schema);
        target.append(create('h1', post.title), create('p', post.summary, 'detail-lead'));
        const body = create('div', '', 'cms-article-body'); renderBody(body, post.body); target.append(body);
        return;
      }
      if (kind === 'research') target.append(create('h2', 'From the R&D desk.'));
      if (!data.length) { target.append(create('p', 'New updates will appear here soon.')); return; }
      const grid = create('div', '', 'cms-grid');
      data.forEach(post => {
        const card = create('article', '', 'cms-card'); card.id = `research-${post.slug}`;
        card.append(create('span', kind === 'blog' ? 'QIXARC JOURNAL' : 'RESEARCH & DEVELOPMENT', 'section-label'), create('h2', post.title), create('p', post.summary));
        if (kind === 'blog') {
          const link = create('a', 'Read article ↗', 'text-link'); link.href = post.slug === 'motion-with-purpose' ? '/blog/motion-with-purpose/' : `/blog/post/?slug=${encodeURIComponent(post.slug)}`; card.append(link);
        } else { const body = create('div', '', 'cms-research-body'); renderBody(body, post.body); card.append(body); }
        grid.append(card);
      });
      target.append(grid);
      if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: 'start' });
    } catch { failed(); }
  };
  function failed() {
    target.replaceChildren(create('p', 'Updates could not be loaded. Please try again.', 'cms-message'));
    const retry = create('button', 'Retry', 'button outline'); retry.addEventListener('click', load); target.append(retry);
  }
  load();
})();
