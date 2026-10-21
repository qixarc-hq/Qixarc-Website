"""Shared service content, policy pages and landing-page interactions."""
from html import escape
import re

SERVICES = [
    dict(slug='ui-ux-design', name='UI/UX design', image='design', title='Thoughtful by design.', description='Intuitive interfaces, clear journeys and a visual identity with character.', tags=['Interface design', 'User experience', 'Prototyping'], steps=[('Understand the journey', 'Identify the people, tasks and friction points the experience should address.'), ('Find the visual direction', 'Explore typography, colour and layouts that make the content easier to understand.'), ('Make it tangible', 'Review a clickable prototype and refine the important interactions together.')]),
    dict(slug='web-development', name='Web development', image='web', title='Your ambition, engineered.', description='Responsive websites built around your content, your audience and your next step.', tags=['Responsive websites', 'Development', 'Performance'], steps=[('Structure the content', 'Agree on pages, navigation and the actions visitors need to take.'), ('Build for real screens', 'Develop reusable layouts that work across phones, tablets and desktop computers.'), ('Prepare for launch', 'Review core journeys, accessibility, search metadata and hosting before handover.')]),
    dict(slug='e-commerce', name='E-commerce', image='commerce', title='Make your next sale simple.', description='Considered storefronts that make discovering products and buying them feel natural.', tags=['Online stores', 'Product catalogues', 'Shopping journeys'], steps=[('Make products discoverable', 'Plan categories, product information and the browsing experience around your catalogue.'), ('Clarify the purchase', 'Design the basket and checkout journey with clear information at each step.'), ('Connect the operations', 'Agree on payment, fulfilment and store-management integrations appropriate to your project.')]),
    dict(slug='digital-systems', name='Digital systems', image='systems', title='Smarter behind the scenes.', description='Focused applications that connect information and simplify everyday workflows.', tags=['Custom workflows', 'Applications', 'Integrations'], steps=[('Map the workflow', 'Understand the repeated task, the people involved and where information needs to move.'), ('Define the boundaries', 'Agree on roles, permissions, data and the integrations the system actually needs.'), ('Build a useful first version', 'Review a focused working flow before deciding what to extend next.')]),
]

def service_cards():
    cards = []
    for i, s in enumerate(SERVICES, 1):
        cards.append(f'''<a class="capability-card interactive-card" href="/services/{s['slug']}/"><div class="capability-art"><img src="/assets/service-{s['image']}.webp" srcset="/assets/service-{s['image']}-540.webp 540w, /assets/service-{s['image']}.webp 900w" sizes="(max-width:760px) calc(100vw - 40px), (max-width:1100px) 45vw, 540px" alt="" width="900" height="600" loading="lazy" decoding="async"><span class="card-open" aria-hidden="true">↗</span></div><div class="capability-copy"><span class="card-index">{i:02d} / CAPABILITY</span><h3>{s['name']}</h3><p>{s['description']}</p><span class="card-action">Explore the service <span aria-hidden="true">↗</span></span></div></a>''')
    return '<div class="capability-grid">' + ''.join(cards) + '</div>'

def enhance_home(home):
    home = re.sub(r'<a class="scroll-cue".*?</a>', '', home, flags=re.S)
    home = re.sub(r'<a class="back-top".*?</a>', '', home, flags=re.S)
    home = re.sub(r'<button id="(?:motion-toggle|qbit-motion)".*?</button>', '', home, flags=re.S)
    home = re.sub(r'(<section class="services section" id="services">).*?(</section>)', lambda m: m[1] + '<div class="wrap"><div class="section-heading"><div><div class="section-label">03 / WHAT WE DO</div><h2 class="reveal">From first thought.<br>To final pixel.</h2></div><p>Design and engineering, connected.<br>Find the right starting point for your idea.</p></div>' + service_cards() + '</div>' + m[2], home, flags=re.S)
    old = r'<div class="about-brand">.*?</div><div class="about-copy">'
    studio = '<a class="about-brand studio-card interactive-card" href="/about/"><span class="card-index">QIXARC / MADURAI</span><div class="studio-image"><img src="/assets/studio-concept.webp" srcset="/assets/studio-concept-540.webp 540w, /assets/studio-concept.webp 900w" sizes="(max-width:760px) calc(100vw - 80px), 45vw" alt="Conceptual creative workspace with blue design objects" width="900" height="600" loading="lazy" decoding="async"></div><div class="studio-caption"><p>Independent minds.<br>Shared ambition.</p><span class="card-open" aria-hidden="true">↗</span></div><span class="card-action">Inside the studio ↗</span></a><div class="about-copy">'
    home = re.sub(old, lambda m: studio, home, flags=re.S)
    home = home.replace('class="about-brand studio-card interactive-card"', 'class="about-brand studio-card interactive-card"')
    home = re.sub(r'<div class="about-values">.*?</div></div><a class="text-link"', '<div class="about-values">' + ''.join(f'<a class="value-card interactive-card" href="/about/#{key}"><span class="value-index">{i:02d}</span><div><h3>{name}</h3><p>{text}</p></div><b aria-hidden="true">↗</b></a>' for i,(key,name,text) in enumerate([('human-first','Human first','Useful experiences, built around real people.'),('built-with-purpose','Built with purpose','Every decision connects design to function.'),('ready-for-tomorrow','Ready for tomorrow','Clear foundations for your next chapter.')],1)) + '</div><a class="text-link"', home, flags=re.S)
    home = home.replace('href="#contact">Meet your next digital partner', 'href="/about/">Meet your next digital partner')
    home = home.replace('Our main service starting prices are listed above. Your final quote depends on pages, features, integrations, and the level of customization. You can also explore the detailed calculator on our current website.', 'Every project is scoped individually. Share your pages, features, integrations and preferred launch window, and we’ll discuss a clear proposal with you.')
    home = home.replace('SCROLL TO EXPLORE', '')
    if 'class="footer-legal"' not in home:
        home = home.replace('<div class="footer-bottom">', '<nav class="footer-legal" aria-label="Policies"><a href="/terms/">Terms &amp; conditions</a><a href="/privacy/">Privacy policy</a><a href="/cookies/">Cookies policy</a><a href="/contact/">Contact</a></nav><div class="footer-bottom">')
    home = home.replace('Your details are sent securely to the QIXARC team.</p>', 'Your details are sent securely to the QIXARC team. <a href="/privacy/">Privacy policy</a>.</p>')
    return home

def detail_pages(hero, cta):
    pages = {}
    for i,s in enumerate(SERVICES,1):
        body = hero('03.' + str(i), s['name'].upper(), s['title'], s['description'])
        body += f'<section class="wrap service-detail-body"><figure class="service-detail-image"><img src="/assets/service-{s["image"]}.webp" alt="Concept illustration for {escape(s["name"])}" width="900" height="600" loading="lazy" decoding="async"><figcaption>QIXARC / {s["name"]} · Concept illustration</figcaption></figure><div class="service-deliverables"><div class="section-label">A CONSIDERED APPROACH</div>'
        body += ''.join(f'<article><span class="card-index">{n:02d}</span><div><h2>{title}</h2><p>{text}</p></div></article>' for n,(title,text) in enumerate(s['steps'],1))
        body += '<div class="tags">' + ''.join(f'<span>{tag}</span>' for tag in s['tags']) + '</div><a class="text-link" href="/services/">View all services ↗</a></div></section>'
        body += cta('Bring your starting point.', 'Tell us what needs to work better. We’ll define the scope together.')
        pages['services/'+s['slug']] = (s['name'], s['description'], body)
    for slug, title, lead, sections in POLICIES:
        content = hero('Q', 'THE DETAILS', title, lead)
        content += '<section class="wrap legal-layout"><nav class="legal-nav" aria-label="Policy navigation"><a href="/terms/">Terms &amp; conditions</a><a href="/privacy/">Privacy policy</a><a href="/cookies/">Cookies policy</a><a href="/contact/">Contact QIXARC ↗</a></nav><article class="legal-copy"><p class="legal-date">Last updated: 21 October 2026</p>'
        content += ''.join(f'<section><span class="card-index">{i:02d}</span><h2>{heading}</h2><p>{text}</p></section>' for i,(heading,text) in enumerate(sections,1))
        content += '<p class="legal-contact">Questions about this page? <a href="mailto:qixarc@gmail.com">qixarc@gmail.com ↗</a></p></article></section>'
        pages[slug] = (title.replace('<br>',' '),lead,content)
    return pages

POLICIES = [
    ('terms', 'Terms &amp;<br>conditions.', 'How to use this website and start a project with QIXARC.', [
        ('About this website', 'This website introduces QIXARC, its services, research and products. You can contact the team at <a href="mailto:qixarc@gmail.com">qixarc@gmail.com</a>. QIXARC is based in Madurai, Tamil Nadu, India.'),
        ('Project enquiries', 'Submitting an enquiry starts a conversation. It does not confirm a booking or create a service agreement. Deliverables, fees, timelines, payment arrangements, ownership and support are agreed separately in writing for each project.'),
        ('Products in development', 'Product descriptions explain the current direction. Features, availability and launch plans may change. A “Coming Soon”, alpha or development label is not a promise of a release date or production readiness. Product websites may have their own terms.'),
        ('Content and permitted use', 'QIXARC branding and original website content remain with their respective owners. You may browse and share links to this site. Ask before reproducing its content or assets for commercial use. Some service artwork is conceptual illustration rather than a client project or an actual office photograph.'),
        ('Responsible use', 'Please do not use the forms for spam, attempt unauthorised access or interfere with the website. Do not submit passwords, payment-card details, confidential customer records or other information that is unnecessary for an initial enquiry.'),
        ('External links and availability', 'Links to social networks, portfolios and product websites take you to independently operated pages. Their content and availability can change. This website may also be updated or temporarily unavailable. Contact us if information appears incorrect.'),
        ('Updates and contact', 'The date above identifies the latest revision. For a question about these website terms or an existing project agreement, contact <a href="mailto:qixarc@gmail.com">qixarc@gmail.com</a>.')]),
    ('privacy', 'Privacy<br>policy.', 'A plain-language explanation of the information this website handles.', [
        ('Information you provide', 'The project form collects your name, reply-to email, message and, when selected, service interest. We use these details to understand your request and respond. Please share only what is needed for the initial conversation.'),
        ('Where enquiries go', 'Enquiries are stored in QIXARC’s Supabase project, and are available to authorised QIXARC administrators. The public website does not display enquiries. Sending the form stores the request in the studio inbox; it does not subscribe you to a newsletter.'),
        ('Hosting and service providers', 'Vercel hosts the website and Supabase provides the database and administrator authentication. These providers may process technical information to operate and protect their services, including request and network information. See <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noopener">Vercel’s privacy notice</a> and <a href="https://supabase.com/privacy" target="_blank" rel="noopener">Supabase’s privacy policy</a> for their practices.'),
        ('Browser storage and Qbit', 'The site uses temporary browser storage for interface state and, after an administrator signs in, their authentication session. Qbit’s shortcuts, blinking and idle prompt run in your browser. Qbit is a website guide; it does not send your conversation to an AI service. Read the <a href="/cookies/">cookies policy</a> for storage details.'),
        ('Access, correction and deletion', 'Email <a href="mailto:qixarc@gmail.com">qixarc@gmail.com</a> if you want to ask what enquiry information we hold, correct it or request deletion. We may need to verify your connection to the request before making changes. There is no automatic enquiry-deletion schedule configured on this website; contact us to discuss a specific request.'),
        ('External websites and updates', 'External links open other services with their own privacy practices. This notice covers the company website; individual QIXARC products may publish separate notices. We will revise this page when the website’s data handling changes.')]),
    ('cookies', 'Cookies &amp;<br>browser storage.', 'What is stored in your browser, and why.', [
        ('The current setup', 'The website does not intentionally install advertising trackers or marketing analytics cookies. The interface uses sessionStorage for temporary state. Hosting and security providers may use their own necessary mechanisms when serving or protecting the site.'),
        ('Interface state', 'Temporary session entries remember the short loading introduction, page navigation transitions and whether the Qbit help nudge has appeared. This state stays in your browser tab and is not submitted with an enquiry.'),
        ('Administrator sessions', 'After an administrator signs in, Supabase Auth stores the session in this tab’s sessionStorage under qixarc-admin-session. This is necessary for the protected inbox to work. It is not an advertising identifier. Signing out clears the authentication session.'),
        ('Your controls', 'You can clear site data from your browser settings or close the tab to clear its sessionStorage. Browser storage settings can affect website features, particularly enquiry delivery and administrator sign-in. If the form cannot connect, you can email QIXARC directly. The site also follows your device’s reduced-motion setting.'),
        ('Third-party links', 'Opening a linked portfolio, social network or product website may introduce that service’s cookies or storage. Check its own policy. Questions about this website can be sent to <a href="mailto:qixarc@gmail.com">qixarc@gmail.com</a>.')]),
]
