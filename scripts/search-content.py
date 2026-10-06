"""Maintain visible, useful service answers and consistent company facts."""
from html import escape
import re

FAQ = [
    ('What does QIXARC do?', 'QIXARC designs and develops business websites, e-commerce experiences, UI/UX interfaces and custom digital systems. The team is based in Madurai, Tamil Nadu, India, and welcomes enquiries from international clients.'),
    ('How can an international client start a project?', 'Send your goals, existing website, required features, preferred time zone and target launch window through our contact form. We can use that brief to agree on scope, communication and review checkpoints before work begins.'),
    ('What is included in a website project?', 'The agreed scope defines the pages, design, development, integrations, content responsibilities and handover. Responsive layouts, core links and forms are reviewed together before launch. Hosting, domain access and ongoing support are agreed for each project.'),
    ('How much does a website cost and how long does it take?', 'Cost and timing depend on the number of pages, required features, integrations and content readiness. Send a project brief so QIXARC can discuss a scope-specific estimate; there is no single price or timeline that fits every build.'),
    ('Can QIXARC redesign an existing website?', 'Yes. Share your current website and what needs to improve, such as navigation, mobile usability, visual design or an enquiry flow. The redesign scope can then be based on those priorities.'),
    ('Are QIXARC’s software products available now?', 'Product availability varies. Scaler Profile is in development and early access, Zevaris AI is coming soon, Serlow is in active development, and DecisionSphere is a prototype in development. Visit the Products page for each product’s current status.'),
]

def apply(root):
    # Owner requested that the legal drafts stay local. Avoid public dead links.
    for page in root.rglob('*.html'):
        text = page.read_text(encoding='utf-8')
        text = re.sub(r'<a href="https://www\.qixarc\.com/(?:privacy-policy|terms-of-service)"[^>]*>(?:Privacy|Terms)</a>', '', text)
        page.write_text(text, encoding='utf-8')
    home = root / 'index.html'
    html = home.read_text(encoding='utf-8')
    html = html.replace('We turn your ambition into thoughtful design<br class="desktop-only"> and high-performance digital products.', 'Web design, development and digital products<br class="desktop-only"> for businesses in India and around the world.')
    home.write_text(html, encoding='utf-8')
    path = root / 'services/index.html'
    html = path.read_text(encoding='utf-8')
    html = html.replace('Choose the problem.<br>We’ll shape the build.', 'Web design &amp; development.<br>Built around your business.')
    html = html.replace('A useful brief starts with what needs to improve: a clearer message, an easier purchase, or less manual work for your team.', 'QIXARC helps businesses plan and build websites, online stores, interfaces and digital systems. Based in Madurai, India, we welcome international projects and agree on scope, communication and handover with each client.')
    html = re.sub(r'<!-- SEARCH ANSWERS -->.*?<!-- /SEARCH ANSWERS -->', '', html, flags=re.S)
    section = '<!-- SEARCH ANSWERS --><section class="wrap detail-section search-answers" aria-labelledby="service-questions"><h2 id="service-questions">Planning a project with QIXARC</h2><div class="faq-list">'
    for question, answer in FAQ:
        section += '<details><summary>' + escape(question) + '<span aria-hidden="true">＋</span></summary><p>' + escape(answer) + '</p></details>'
    section += '</div><p><a class="text-link" href="/contact/">Send your project brief ↗</a> · <a class="text-link" href="/products/">Explore product statuses</a> · <a class="text-link" href="/about/">Meet the team</a></p></section><!-- /SEARCH ANSWERS -->'
    html = html.replace('</main>', section + '</main>')
    path.write_text(html, encoding='utf-8')
