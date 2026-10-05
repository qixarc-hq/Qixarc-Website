"""Product and story content, based on Kabibalan's public portfolio (2026-10-04)."""

products = [
    ('scaler-profile', 'Scaler Profile', 'In development / early access', 'Messaging automation',
     'A focused platform for businesses and creators to manage WhatsApp and Instagram conversations, capture leads and automate follow-ups.',
     ['Channel replies and routing', 'Lead tracking and customer engagement', 'Workflow automation with human handoff'],
     'Core messaging flows are defined; the automation engine and channel integrations are being built.', 'scaler.html'),
    ('zevaris-ai', 'Zevaris AI', 'Coming soon', 'AI assistance & automation',
     'An AI platform in development for businesses and individuals, bringing everyday automation, timely insights and intelligent assistance into one place.',
     ['AI assistance for practical tasks', 'Automation for routine work', 'Real-time analytics and recommendations'],
     'The brand and coming-soon presence are live. Work is underway on the AI, automation and analytics foundations.', 'zevaris.html'),
    ('serlow', 'Serlow', 'In active development', 'Collaborative workspace',
     'A connected workspace designed to bring AI-assisted notes, visual documentation, tasks and code activity together for distributed teams.',
     ['Smart notes and visual documents', 'Project management with GitHub integration', 'An interactive virtual-office concept'],
     'The workspace architecture and editor experience are defined. Smart notes, project tools and GitHub integration are in development; the virtual-office beta comes next.', 'serlow.html'),
    ('decision-sphere', 'DecisionSphere', 'Prototype / in development', 'Decision intelligence',
     'Built around Strategic Analysis AI, DecisionSphere helps people explore a decision’s objectives, constraints, risks and possible consequences before choosing a direction.',
     ['Structured reasoning and ripple-effect simulation', 'Probabilistic outcomes and risk analysis', 'Recommendations with implementation plans'],
     'The decision model and dashboard direction are defined. Reasoning and simulation flows are prototyped, with an interactive beta planned. People remain the decision-makers.', 'decisionsphere.html')
]

def product_mark(slug, title):
    if slug == 'scaler-profile':
        return '<img src="/assets/scaler-profile.webp" alt="Scaler Profile emblem" width="720" height="600" loading="lazy">'
    sizes = {'zevaris-ai': (596, 329), 'serlow': (608, 461), 'decision-sphere': (478, 408)}
    width, height = sizes[slug]
    return f'<img class="supplied-product-logo" src="/assets/{slug}-logo.png" alt="{title} logo" width="{width}" height="{height}" loading="lazy" decoding="async">'

def product_page(hero, cta):
    sections = []
    for index, (slug, title, status, category, description, features, progress, source) in enumerate(products, 1):
        sections.append(f'''<article class="catalogue-product wrap" id="{slug}">
        <div class="catalogue-art art-{slug}">{product_mark(slug, title)}<span class="catalogue-number">0{index} / QIXARC</span></div>
        <div class="catalogue-copy"><span class="status-chip">{status}</span><h2>{title}</h2><span class="section-label">{category}</span><p>{description}</p>
        <ul>{''.join(f'<li>{feature}</li>' for feature in features)}</ul><p class="product-progress">{progress}</p>
        <div class="product-actions"><a class="text-link" href="https://kabibalansportfolio.vercel.app/{source}" target="_blank" rel="noopener">Read the product case study ↗</a>
        {('<a class="button dark" href="https://scalerprofile.vercel.app/" target="_blank" rel="noopener">Explore early access ↗</a>' if slug == 'scaler-profile' else '<a class="text-link" href="/contact/">Ask about this product ↗</a>')}</div></div></article>''')
    return ('Products', 'Explore QIXARC’s Scaler Profile, Zevaris AI, Serlow and DecisionSphere, with current development stages and product capabilities.',
        hero('03', 'THE PRODUCT LINEUP', 'Four products.<br>One builder’s mindset.', 'Messaging, intelligent assistance, collaboration and decisions. Explore what each QIXARC product is being built to do.') +
        '<nav class="wrap catalogue-index" aria-label="Product index">'+''.join(f'<a href="#{p[0]}">{p[1]} ↘</a>' for p in products)+'</nav>' + ''.join(sections) +
        cta('Curious about what comes next?', 'Tell us which product you are interested in and how you would use it.', '/contact/', 'Talk to QIXARC'))

def team_profiles():
    people = [
        ('Kabibalan', 'Founder', 'https://kabibalansportfolio.vercel.app/'),
        ('Sri', 'Co-founder', 'https://srisaanthportfolio.vercel.app/'),
        ('Giri', 'Managing Director', 'https://giri-manigandan-portfolio.vercel.app/'),
    ]
    cards = ''.join(f'''<a class="team-profile" href="{url}" target="_blank" rel="noopener" aria-label="{name}, {role} — view portfolio (opens in a new tab)">
        <span class="team-profile-index" aria-hidden="true">0{i+1} / QIXARC</span>
        <h3>{name}</h3><p>{role}</p><span class="team-profile-link">View portfolio <span aria-hidden="true">↗</span></span></a>''' for i,(name,role,url) in enumerate(people))
    return '<div class="team-profiles" id="team"><div class="section-label">THE PEOPLE / OUR LEADERSHIP</div><h2>Meet the team.</h2><div class="team-profile-grid">'+cards+'</div></div>'

def home_products():
    cards = []
    for slug, title, status, category, description, features, progress, source in products:
        cards.append(f'<a class="home-product-card" href="/products/#{slug}"><div class="home-product-art art-{slug}">{product_mark(slug,title)}</div><div class="home-product-info"><span class="section-label">{status}</span><h3>{title} <span aria-hidden="true">↗</span></h3><p>{category}</p></div></a>')
    return '<section class="work wrap section" id="products"><div class="section-heading"><div><div class="section-label">02 / OUR PRODUCTS</div><h2>Built to solve.<br>Designed to grow.</h2></div><p>Explore the QIXARC product lineup.</p></div><div class="home-product-grid">'+''.join(cards)+'</div></section>'

chapters = [
    ('2024', 'Curiosity becomes practice.', 'Hi, I’m QBit. Our story starts with Kabibalan S, a B.Tech Information Technology student in Tamil Nadu. His approach is simple: learn by building software around real problems.', 'The first foundation', 'Kabibalan began his B.Tech in Information Technology at Hindusthan Institute of Technology in 2024. His work spans software development, AI, SaaS and automation.'),
    ('2025', 'An idea gets a name.', 'In 2025, Kabibalan founded QIXARC. It gave his work a shared home: a technology startup for software, AI-powered applications and automation.', 'From builder to founder', 'QIXARC brings product development, architecture and business strategy together. The focus is practical software that turns ideas into useful digital experiences.'),
    ('2025', 'Real problems guide the work.', 'Next came AI applications and business automation. The goal wasn’t to add technology for its own sake. It was to reduce repetitive work and make room for the decisions people need to make.', 'Learning through building', 'Hands-on development and GitHub contributions became part of the learning process. Software, interfaces and workflows grew together through practical work.'),
    ('2026', 'A family of products.', 'Now the story has four product directions: Scaler Profile for conversations, Serlow for teamwork, DecisionSphere for structured decisions, and Zevaris AI for intelligent assistance. They are at different stages of development.', 'One vision, distinct problems', 'Scaler Profile and Serlow are in development. DecisionSphere’s reasoning and simulation flows are prototyped. Zevaris AI is coming soon, with its core platform being built.'),
    ('NEXT', 'The next chapter is open.', 'And where do we go from here? The ambition is to grow QIXARC into a technology company with products that reach people around the world. I’ll be here to help you explore what we build next.', 'An ambition, not a finish line', 'The roadmap looks toward Kabibalan’s expected graduation in 2028 and continued product development. The next chapter is about turning prototypes and early builds into experiences people can use.')
]

def story_timeline():
    milestones = ''.join(f'''<li class="story-milestone" data-milestone="{i}">
        <span class="milestone-dot" aria-hidden="true"></span>
        <div class="milestone-date"><span>{c[0]}</span><span>/ 0{i+1}</span></div>
        <div class="milestone-copy"><h3>{c[1]}</h3><p>{c[4]}</p>
</div></li>''' for i,c in enumerate(chapters))
    return '''<section class="wrap story-timeline" aria-labelledby="story-timeline-title">
        <div class="timeline-caption"><span class="section-label">02 / THE JOURNEY</span><span class="section-label">QIXARC / MILESTONES</span></div>
        <h2 id="story-timeline-title">One idea.<br>A story<br>in motion.</h2>
        <p class="timeline-intro">From the first foundations to what comes next. Follow the moments that shape QIXARC.</p>
        <div class="timeline-route"><div class="timeline-track" aria-hidden="true"><span class="timeline-fill"></span></div>
        <div class="timeline-qbit" aria-hidden="true"><div class="timeline-qbit-float"><span class="timeline-qbit-antenna"></span><span class="timeline-qbit-face"><i></i><i></i></span><span class="timeline-qbit-beam"></span></div></div>
        <ol>''' + milestones + '</ol></div></section>'

def story_page(hero, cta):
    return ('Story', 'Let QBit guide you through QIXARC’s beginnings, founder Kabibalan S, and the products taking shape today.',
        hero('02', 'THE QIXARC STORY', 'Every idea<br>starts somewhere.', 'Meet QBit, your guide to the people, questions and products behind QIXARC.') +
        '<section class="wrap story-experience" aria-label="QBit tells the QIXARC story"><div class="story-host"><span class="section-label">QBIT / YOUR STORYTELLER</span><div class="story-bot"><div class="story-bot-fallback" aria-hidden="true"><span>● &nbsp; ●</span></div><canvas id="qbit-story-canvas" aria-label="Animated QBit robot"></canvas></div><p>“Come along. I’ll show you<br>how the pieces connect.”</p><button class="text-link" id="story-motion" type="button" aria-pressed="false" hidden>Pause QBit Ⅱ</button></div><div class="story-reader qbit-intro" id="story-reader"><span class="section-label">MEET QBIT / YOUR QIXARC COMPANION</span><h2>A little curiosity.<br>A friendly guide.</h2><p class="qbit-narration">“Hi, I’m QBit — the little blue companion you’ll meet around QIXARC. I’m here to help you find your way, explore what we’re building and get to know the people and ideas behind it.”</p><div class="story-context"><h3>Small bot. Shared curiosity.</h3><p>QBit brings a friendly face to our love of design and technology. With a curious expression and a little motion, our digital mascot makes exploring QIXARC feel more personal.</p><h3>Always nearby.</h3><p>Look for QBit in the bottom-right corner to explore the website’s sections. Here on the Story page, follow our blue companion along the timeline as QIXARC’s journey unfolds.</p></div><a class="text-link" href="#story-timeline-title">Follow our journey <span aria-hidden="true">↓</span></a></div></section>' +
        story_timeline() + '<p class="wrap story-source">Story milestones based on <a href="https://kabibalansportfolio.vercel.app/" target="_blank" rel="noopener">Kabibalan’s portfolio ↗</a>.</p>' +
        cta('Meet the products in the story.', 'Explore their purpose, progress and next steps.', '/products/', 'Explore the lineup'))
