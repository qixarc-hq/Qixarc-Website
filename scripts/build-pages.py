"""Generate QIXARC's static detail pages from the shared landing-page shell."""
from pathlib import Path
import re
import runpy
content = runpy.run_path(str(Path(__file__).with_name("product-story.py")))

root = Path(__file__).resolve().parents[1] / 'dist'
home = (root / 'index.html').read_text(encoding='utf-8')
home = re.sub(r'<link[^>]+fonts\.(?:googleapis|gstatic)[^>]+>\s*', '', home)
home = re.sub(r'<link href="https://fonts.googleapis.com[^>]+>\s*', '', home)
home = re.sub(r'/style.css\?v=[^" ]+', '/style.css?v=pages-1', home)
home = re.sub(r'/app.js\?v=[^" ]+', '/app.js?v=story-products-1', home)
home = re.sub(r'/guide.js\?v=[^" ]+', '/guide.js?v=no-pricing-2', home)
if '/pages.css' not in home:
    home = home.replace('</head>', '<link rel="stylesheet" href="/pages.css?v=service-hover-1">\n<script src="/navigation.js?v=slow-switch-2" defer></script>\n</head>')
nav = re.search(r'<nav aria-label="Main navigation".*?</nav>', home, re.S).group()
for name in ['products', 'services', 'about', 'pricing', 'contact']:
    nav = nav.replace(f'href="#{name}"', f'href="/{name}/"')
nav = nav.replace('href="/pricing/">Pricing</a>', 'href="/research/">R&amp;D</a>')
if 'href="/blog/"' not in nav:
    nav = nav.replace('</div>', '<a href="/blog/">Blog</a></div>', 1)
if 'href="/story/"' not in nav:
    nav = re.sub(r'(<a[^>]*>Home</a>)', r'\1<a href="/story/">Story</a>', nav)
nav = nav.replace('href="#top"', 'href="/"').replace('aria-current="location"', 'aria-current="page"')
home = re.sub(r'<nav aria-label="Main navigation".*?</nav>', lambda m: nav, home, flags=re.S)
footer = re.search(r'<footer>.*?</footer>', home, re.S).group()
footer = footer.replace('href="#top"', 'href="#main"')
if 'href="/story/"' not in footer:
    footer = footer.replace('<a href="/products/">', '<a href="/story/">Story</a><a href="/products/">', 1)
footer = footer.replace('href="/pricing/">Pricing</a>', 'href="/research/">R&amp;D</a>')
if 'href="/blog/"' not in footer:
    footer = footer.replace('href="/research/">R&amp;D</a>', 'href="/research/">R&amp;D</a><a href="/blog/">Blog</a>')
for name in ['products', 'services', 'about', 'pricing']:
    footer = footer.replace(f'href="#{name}"', f'href="/{name}/"')
home = re.sub(r'<footer>.*?</footer>', lambda m: footer, home, flags=re.S)
home = home.replace('class="button dark" href="#products"', 'class="button dark" href="/products/"')
home = re.sub(r'<section class="work wrap section" id="products">.*?</section>', lambda m: content['home_products'](), home, flags=re.S)
home = home.replace('Explore the Scaler Profile in our Products section', 'Explore our lineup in the Products section')
home = re.sub(r'<!-- team-profiles -->.*?<!-- /team-profiles -->', '', home, flags=re.S)
home = re.sub(r'(<section class="about wrap section" id="about">.*?)(</section>)', lambda m: m[1] + '<!-- team-profiles -->' + content['team_profiles']() + '<!-- /team-profiles -->' + m[2], home, flags=re.S)
home = re.sub(r'/pages.css\?v=[^" ]+', '/pages.css?v=team-profiles-1', home)
if '/speed-insights-init.js' not in home:
    home = home.replace('</head>', '<script type="module" src="/speed-insights-init.js"></script></head>')
(root / 'index.html').write_text(home, encoding='utf-8')

def hero(index, label, title, text):
    return f'<section class="detail-hero wrap"><div class="section-label">/{index} — {label}</div><h1>{title}</h1><p class="detail-lead">{text}</p></section>'

def cards(items):
    return '<div class="detail-cards">' + ''.join(f'<article class="detail-card reveal"><span class="section-label">0{i+1}</span><h2>{title}</h2><p>{text}</p></article>' for i,(title,text) in enumerate(items)) + '</div>'

def cta(title, text, link='/contact/', label='Start a project'):
    return f'<section class="detail-cta wrap"><div><h2>{title}</h2><p>{text}</p></div><a class="button dark" href="{link}">{label} <span aria-hidden="true">↗</span></a></section>'

pages = {}
pages['products'] = ('Products', 'Explore Scaler Profile, QIXARC’s conversation operating system, and visit its early-access website.',
    hero('02', 'PRODUCT LAB', 'One profile.<br>Every conversation.', 'Scaler Profile brings customer context into one place, so the next conversation can start where the last one ended.') +
    '<section class="product-detail wrap"><div class="product-mark"><img src="/assets/scaler-profile.webp" alt="Scaler Profile metallic emblem" width="720" height="600"><span class="section-label">SCALER PROFILE / BY QIXARC</span></div><div><span class="status-chip">EARLY ACCESS</span><h2>Context that<br>stays connected.</h2><p>Customer memory, AI conversations, workflows and CRM are being brought together across WhatsApp, Instagram and email. The product is designed around a shared profile instead of disconnected inboxes.</p><a class="button dark" href="https://scalerprofile.vercel.app/" target="_blank" rel="noopener">Discover Scaler Profile ↗</a><p class="detail-note">Explore the product’s current features and join its priority list on the official website.</p></div></section>' +
    '<section class="wrap detail-section">' + cards([('Remember the context.', 'Carry the customer’s history between channels, reducing repeated questions and fragmented notes.'), ('Choose the autonomy.', 'Move from suggested replies to assisted drafts and automated actions, with human handoff when needed.'), ('Test before launch.', 'Explore a workflow in the simulator before introducing it to live customer conversations.')]) + '</section>' +
    cta('Built here. Growing forward.', 'Follow the first release through the Scaler Profile priority list.', 'https://scalerprofile.vercel.app/join', 'Explore early access'))

pages['services'] = ('Services', 'Plan your website or digital system with QIXARC. Explore deliverables, collaboration and launch preparation.',
    hero('03', 'CAPABILITIES', 'Choose the problem.<br>We’ll shape the build.', 'A useful brief starts with what needs to improve: a clearer message, an easier purchase, or less manual work for your team.') +
    '<section class="wrap detail-section">' + cards([('Experience & identity', 'Map the key user journeys, establish a visual direction and review an interactive prototype before development begins.'), ('Websites & storefronts', 'Define the page structure, product information and conversion paths. Build layouts that remain usable across phones, tablets and desktop screens.'), ('Applications & operations', 'Outline roles, data and integrations. Turn a repeated business task into a focused interface with clear permissions and predictable behaviour.')]) + '</section>' +
    '<section class="wrap editorial-split"><div><span class="section-label">THE WORKING AGREEMENT</span><h2>Know what<br>you’re getting.</h2></div><div class="detail-rows"><article><h3>Before design</h3><p>We agree on the audience, required pages, features and content responsibilities. Unknowns become questions to resolve, not assumptions.</p></article><article><h3>During the build</h3><p>Review the direction at agreed checkpoints. Collect feedback in one place so changes stay connected to the original goal.</p></article><article><h3>At handover</h3><p>Review responsive behaviour, core links and forms together. Confirm hosting, domain access and any ongoing support in the project scope.</p></article></div></section>' +
    cta('Bring the rough version.', 'A sketch, an existing site or a workflow description is enough to begin.'))

pages['about'] = ('About', 'Meet QIXARC’s approach to independent digital design and development from Madurai, India.',
    hero('04', 'INSIDE QIXARC', 'A studio with<br>a builder’s mindset.', 'Our starting point is curiosity: what should this experience help someone do, and what is getting in their way?') +
    '<section class="wrap editorial-split"><div class="studio-mark"><img src="/assets/qixarc-logo.webp" alt="QIXARC blue and purple logo" width="620" height="625"><span class="section-label">MADURAI, INDIA / CONNECTED EVERYWHERE</span></div><div><h2>Less distance.<br>Better decisions.</h2><p>Design and development work best when they are part of the same conversation. We keep visual choices connected to how a product will behave in someone’s hands.</p><p>Working from Madurai gives us a home base. A shared brief, visible progress and direct feedback give every project its direction.</p></div></section>' +
    '<section class="wrap detail-section">' + cards([('Ask before adding.', 'A new feature should earn its place. We start by understanding the task it supports and the complexity it introduces.'), ('Make the work visible.', 'Ideas become easier to discuss when you can see them. We use concrete layouts and working screens to move the conversation forward.'), ('Leave room to evolve.', 'A launch is a starting point. Clear structure and thoughtful handover make future improvements easier to approach.')]) + '</section>' +
    '<section class="wrap detail-section">' + content['team_profiles']() + '</section>' +
    cta('Your context matters.', 'Tell us about the people your next product needs to serve.'))

pages['research'] = ('R&amp;D', 'Explore QIXARC’s research and development focus: useful AI, expressive interfaces and purposeful prototypes.',
    hero('05', 'RESEARCH & DEVELOPMENT', 'Questions first.<br>Possibilities next.', 'A space to explore emerging ideas, challenge assumptions and turn uncertainty into something we can test.') +
    '<section class="wrap research-banner"><div><span class="section-label">QIXARC / EXPLORATION SPACE</span><h2>Think it.<br>Test it.<br>Refine it.</h2><p>Research is a way to ask better questions before committing to a bigger build.</p></div><div class="research-diagram" aria-label="Research cycle: question, prototype, observe, refine"><span>01 / QUESTION</span><b aria-hidden="true">↓</b><span>02 / PROTOTYPE</span><b aria-hidden="true">↓</b><span>03 / OBSERVE</span><b aria-hidden="true">↓</b><span>04 / REFINE</span></div></section>' +
    '<section class="wrap detail-section"><div class="section-label">DIRECTIONS TO EXPLORE</div>' + cards([('Human-guided AI', 'How can an assistant make routine work easier while keeping important choices visible and under human control?'), ('Interfaces in motion', 'Where can animation clarify a change of state, and where should the interface simply get out of the way?'), ('Connected workflows', 'What happens when information moves between tools without forcing people to repeat the same work?')]) + '</section>' +
    '<section class="wrap editorial-split"><div><span class="section-label">FROM QUESTION TO LEARNING</span><h2>Small tests.<br>Useful answers.</h2></div><div class="detail-rows"><article><h3>Define the uncertainty</h3><p>Write down the question, who it matters to and what evidence would help answer it.</p></article><article><h3>Build only enough</h3><p>A sketch, a clickable flow or a focused technical prototype can expose an assumption without requiring a complete product.</p></article><article><h3>Keep the learning</h3><p>Compare what happened with what was expected. Decide what to refine, what to investigate next and what to leave behind.</p></article></div></section>' +
    cta('Have a question worth testing?', 'Bring a workflow, a product idea or a technical challenge to explore.', '/contact/', 'Discuss an idea'))

pages['blog'] = ('Blog', 'Notes from QIXARC on design, development and the decisions behind useful digital products.',
    hero('06', 'THE QIXARC JOURNAL', 'Ideas behind<br>the interface.', 'Notes on the choices that shape digital experiences, from an early question to a working product.') +
    '<section class="wrap detail-section"><a class="journal-card" href="/blog/motion-with-purpose/"><div class="journal-art" aria-hidden="true"><span class="section-label">DESIGN NOTES / 001</span><strong>MOVE<br>WITH<br>PURPOSE.</strong><span class="journal-arrow">↗</span></div><div class="journal-summary"><span class="section-label">DESIGN / 4 MIN READ</span><h2>Motion should explain<br>what happens next.</h2><p>A practical approach to page transitions, feedback and making room for people who prefer less movement.</p><span class="text-link">Read the article <span aria-hidden="true">↗</span></span></div></a></section>' +
    cta('Keep the questions coming.', 'Explore the questions behind our approach to research and prototyping.', '/research/', 'Explore R&D'))

pages['blog/motion-with-purpose'] = ('Motion with purpose', 'A QIXARC design note on using animation to explain navigation, communicate feedback and respect reduced-motion preferences.',
    '<div class="wrap article-back"><a class="text-link" href="/blog/">← All articles</a></div>' +
    hero('06.01', 'DESIGN NOTES / 4 MIN READ', 'Motion should<br>have a purpose.', 'An animation earns its place when it makes an interaction easier to understand. Here is a way to decide what belongs.') +
    '<article class="journal-article wrap"><aside><span class="section-label">QIXARC / STUDIO NOTES</span><nav aria-label="Article contents"><a href="#orientation">01 / Orientation</a><a href="#feedback">02 / Feedback</a><a href="#restraint">03 / Restraint</a><a href="#checklist">04 / The check</a></nav></aside><div class="article-copy"><p class="article-intro">A page can move beautifully and still be difficult to use. The useful question is not how much animation a screen can hold, but what each movement tells the person looking at it.</p><section id="orientation"><h2>Make the change clear.</h2><p>Moving between pages is a change of context. A transition can mark that moment and introduce the destination before the new content arrives. Its job is to connect the action with the result.</p><p>At QIXARC, the page curtain uses the destination name as its focal point. The surrounding content changes while the curtain covers the screen, then the next page is revealed. The movement has a beginning and an end.</p></section><section id="feedback"><h2>Acknowledge the action.</h2><p>A selected option, an expanded menu or a form message should make its state clear. Small changes in colour, position or opacity can support that feedback.</p><p>The message still needs to work without movement. A label should explain what happened; an animation should reinforce it. For example, preparing an email draft is different from sending a message, and the interface should say so.</p></section><section id="restraint"><h2>Know when to stop.</h2><p>Repeated motion competes with reading. Keep the main task in view and give decorative movement a quieter role. A pause control is useful when a page includes ongoing animation.</p><p>For people who prefer reduced motion, keep the navigation and content available with a simpler change of state. The information should never depend on watching an effect.</p></section><section id="checklist"><h2>Four questions before shipping.</h2><ol><li>Does the movement explain a change or provide useful feedback?</li><li>Can someone continue their task without waiting unnecessarily?</li><li>Is the meaning still clear with animation disabled?</li><li>Does the experience hold together on a smaller screen?</li></ol><p>If an effect has no clear answer to the first question, removing it is often the most useful design decision.</p></section><a class="text-link" href="/blog/">← Back to the journal</a></div></article>' +
    cta('Turn the idea into an experience.', 'Explore how we approach interface design and development.', '/services/', 'Explore services'))

pages['contact'] = ('Contact', 'Start a conversation with QIXARC about your next project. Email the studio or prepare a project brief.',
    hero('07', 'OPEN A CONVERSATION', 'Tell us what<br>needs to change.', 'Share the current situation and the outcome you want. We can work out the details together.') +
    '<section class="wrap contact-detail"><div><h2>Direct to the studio.</h2><a class="contact-email" href="mailto:qixarc@gmail.com">qixarc@gmail.com</a><a class="contact-phone" href="tel:+918300715081">+91 83007 15081</a><p>Based in Madurai, Tamil Nadu.</p><div class="contact-checklist"><h3>Helpful to include</h3><p>A link to your existing site, the main challenge, essential features and a rough launch window.</p></div></div><form id="project-form"><div class="form-row"><label>Contact name<input name="name" autocomplete="name" placeholder="Your name" required maxlength="100"></label><label>Reply-to email<input name="email" type="email" autocomplete="email" placeholder="Where can we reach you?" required maxlength="180"></label></div><label class="brief-label">Your project brief<textarea name="message" placeholder="What works today, what doesn’t, and what would you like to build?" required minlength="10" maxlength="5000" rows="6"></textarea></label><button class="button dark" type="submit">Create email draft ↗</button><p class="form-help">Your email app opens with a draft. Nothing is sent until you send it.</p><p id="form-status" role="status"></p><button type="button" id="copy-enquiry" class="text-link" hidden>Copy the prepared brief</button></form></section>')

pages['products'] = content['product_page'](hero, cta)
pages['story'] = content['story_page'](hero, cta)
head = home.split('<body>')[0]
if '/about-motion.js' not in head:
    head = head.replace('</head>', '<script src="/about-motion.js?v=product-logos-1" defer></script></head>')
if '/speed-insights-init.js' not in head:
    head = head.replace('</head>', '<script type="module" src="/speed-insights-init.js"></script></head>')
header = re.search(r'<header.*?</header>', home, re.S).group()
guide = re.search(r'<aside id="qbit-guide".*?</aside>', home, re.S).group()
for slug, (title, description, content) in pages.items():
    pagehead = re.sub(r'<title>.*?</title>', f'<title>{title} | QIXARC</title>', head)
    pagehead = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m[1]+description, pagehead)
    pagehead = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m[1]+title+' | QIXARC', pagehead)
    pagehead = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m[1]+description, pagehead)
    navslug = slug.split('/')[0]
    pageheader = header.replace(' aria-current="page"', '').replace(f'href="/{navslug}/"', f'href="/{navslug}/" aria-current="page"')
    pageguide = guide
    for section in ['products','services','about','pricing','contact']:
        destination = 'research' if section == 'pricing' else section
        pageguide = pageguide.replace(f'href="#{section}"', f'href="/{destination}/"')
    pageguide = pageguide.replace('>Pricing</a>', '>R&amp;D</a>')
    output = pagehead + f'<body class="detail-page" data-page="{slug}"><a class="skip" href="#main">Skip to content</a><div class="scroll-progress" aria-hidden="true"></div>' + pageheader + '<main id="main">' + content + '</main>' + footer + pageguide + '<script src="/app.js?v=story-products-1" defer></script><script type="module" src="/guide.js?v=no-pricing-2"></script></body></html>'
    if slug == 'story':
        output = output.replace('</head>', '<link rel="stylesheet" href="/story-timeline.css?v=2"></head>')
        output = output.replace('</body>', '<script src="/story.js?v=qbit-intro-2" defer></script></body>')
    folder = root / slug
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'index.html').write_text(output, encoding='utf-8')
print(f'Updated landing navigation and generated {len(pages)} detail pages.')

runpy.run_path(str(Path(__file__).with_name("connect-cms.py")))["connect"](root)
runpy.run_path(str(Path(__file__).with_name("export-published.py")))["apply"](root)
runpy.run_path(str(Path(__file__).with_name("search-content.py")))["apply"](root)
runpy.run_path(str(Path(__file__).with_name("seo.py")))["apply"](root)
