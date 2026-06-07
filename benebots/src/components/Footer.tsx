import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Send, ExternalLink, Calendar } from 'lucide-react'

const CONTACT_EMAIL = 'ty@infiniteawesomestudio.com'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
]

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/mybenefitsguy',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/mybenefitsguy',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@mybenefitsguy',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
      </svg>
    ),
  },
  {
    label: 'Threads',
    href: 'https://www.threads.net/@mybenefitsguy',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.474 12.01v-.017c.03-3.579.885-6.43 2.525-8.482C5.856 1.205 8.61.024 12.19 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.006.216.012.321.02 1.5.136 2.733.683 3.576 1.582 1.297 1.383 1.491 3.395.528 5.642-1.362 3.185-4.177 4.747-8.782 4.777zM10.076 13.5c-.176.978.233 1.713 1.227 2.054.618.21 1.36.182 2.032-.077.97-.373 1.562-1.143 1.76-2.29a11.026 11.026 0 0 0-2.537-.188c-1.052.057-1.972.397-2.482 1.501z"/>
      </svg>
    ),
  },
]

const externalLinks = [
  { label: 'MyBenefitsGuy Hub', href: 'https://mybenefitsguy.com', desc: 'Employee benefits education' },
  { label: 'Infinite Awesome Studio', href: 'https://infiniteawesome.studio', desc: 'The team behind BeneBots' },
]

function LeadForm() {
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: 'BeneBots | New consultation request',
        }),
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center">
          <span className="text-2xl" role="img" aria-label="Checkmark">✓</span>
        </div>
        <div>
          <p className="font-display font-bold text-dark-text text-lg mb-1">Got it. We'll be in touch.</p>
          <p className="text-sm font-body text-dark-muted">
            Expect a response within one business day. In the meantime, every benefit. Every penny.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Contact form">
      <div>
        <label htmlFor="contact-name" className="block text-xs font-body text-dark-muted mb-1.5 uppercase tracking-wider">Name</label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          maxLength={100}
          className="w-full px-4 py-2.5 text-sm font-body bg-dark-base border border-dark-border rounded-xl text-dark-text placeholder-dark-muted focus:outline-none focus:border-mint/40 transition-colors"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-xs font-body text-dark-muted mb-1.5 uppercase tracking-wider">Work Email</label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@brokerage.com"
          maxLength={254}
          className="w-full px-4 py-2.5 text-sm font-body bg-dark-base border border-dark-border rounded-xl text-dark-text placeholder-dark-muted focus:outline-none focus:border-mint/40 transition-colors"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-xs font-body text-dark-muted mb-1.5 uppercase tracking-wider">What's on your plate? (optional)</label>
        <textarea
          id="contact-message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Open enrollment chaos, stewardship reports, COBRA follow-ups…"
          className="w-full px-4 py-2.5 text-sm font-body bg-dark-base border border-dark-border rounded-xl text-dark-text placeholder-dark-muted focus:outline-none focus:border-mint/40 transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-mint text-deep-forest font-display font-semibold py-3 px-5 rounded-xl hover:bg-[#00a868] transition-colors shadow-lg shadow-mint/20 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending…' : (<><Send size={15} /> Send Message</>)}
      </button>
      <p className="text-[11px] font-body text-dark-muted text-center">
        No spam. No drip campaigns. Just a real conversation about what the bot can take off your plate.
      </p>
    </form>
  )
}

function NewsletterCapture() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, _subject: 'BeneBots | Newsletter signup', type: 'newsletter' }),
    }).catch(() => null)
    setSubmitted(true)
  }

  return submitted ? (
    <p className="text-sm font-body text-mint">You're in. We'll keep it worth your while.</p>
  ) : (
    <form onSubmit={handleSubmit} className="flex gap-2" aria-label="Newsletter signup">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 px-3 py-2 text-sm font-body bg-dark-base border border-dark-border rounded-lg text-dark-text placeholder-dark-muted focus:outline-none focus:border-mint/40 transition-colors"
        aria-label="Email address for newsletter"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-mint text-deep-forest text-sm font-display font-semibold rounded-lg hover:bg-[#00a868] transition-colors flex-shrink-0"
      >
        Subscribe
      </button>
    </form>
  )
}

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const items = el.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.05 }
    )
    items.forEach(i => io.observe(i))
    return () => io.disconnect()
  }, [])

  return (
    <footer ref={sectionRef} className="bg-dark-surface border-t border-dark-border">
      {/* CTA strip */}
      <div id="demo" className="border-b border-dark-border py-16 px-4 sm:px-6 bg-grid">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div className="reveal">
            <div className="inline-flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              <span className="text-xs font-body text-dark-muted uppercase tracking-widest">Let's talk</span>
            </div>
            <h2 id="contact" className="font-display font-bold text-3xl sm:text-4xl text-dark-text mb-4 leading-tight">
              Ready to hand off the{' '}
              <span className="text-mint">dumb questions</span>{' '}
              that aren't actually dumb?
            </h2>
            <p className="text-base font-body text-dark-muted leading-relaxed mb-8 max-w-md">
              Tell us what's on your plate. We'll scope the right BeneBot. No deck, no pressure, just a real conversation about where your team is spending time it shouldn't be.
            </p>
            <a
              href="https://calendly.com/benebots/discovery"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-dark-border text-dark-text font-body font-medium px-5 py-3 rounded-xl hover:border-mint/40 hover:text-mint transition-all text-sm"
            >
              <Calendar size={16} /> Book a 30-min discovery call <ExternalLink size={13} />
            </a>
          </div>

          <div className="reveal bg-dark-card border border-dark-border rounded-2xl p-6" style={{ transitionDelay: '0.15s' }}>
            <h3 className="font-display font-bold text-lg text-dark-text mb-1">Send us a message</h3>
            <p className="text-xs font-body text-dark-muted mb-5">We respond within one business day.</p>
            <LeadForm />
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="reveal sm:col-span-2 lg:col-span-1">
          <a href="/" className="flex items-center gap-2 mb-4" aria-label="BeneBots home">
            <img src="/benebots-logo-dark-tp.png" alt="BeneBots by Infinite Awesome Studio" className="h-10 w-auto" />
          </a>
          <p className="text-xs font-body text-dark-muted leading-relaxed max-w-[220px]">
            AI agents for benefits administration. Every benefit. Every penny.
          </p>
          <a href="https://infiniteawesome.studio" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block" aria-label="Infinite Awesome Studio">
            <img src="/ias-logo-dark.png" alt="Infinite Awesome Studio" className="h-10 w-auto opacity-50 hover:opacity-90 transition-opacity" />
          </a>
          <div className="flex items-center gap-3 mt-4">
            {socialLinks.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`MyBenefitsGuy on ${s.label}`}
                className="text-dark-muted hover:text-mint transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="reveal" style={{ transitionDelay: '0.1s' }}>
          <h4 className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-4">Site</h4>
          <ul className="space-y-2.5">
            {navLinks.map(l => (
              <li key={l.label}>
                <a href={l.href} className="text-sm font-body text-dark-muted hover:text-mint transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal" style={{ transitionDelay: '0.2s' }}>
          <h4 className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-4">Ecosystem</h4>
          <ul className="space-y-3">
            {externalLinks.map(l => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col">
                  <span className="text-sm font-body text-dark-muted group-hover:text-mint transition-colors flex items-center gap-1">
                    {l.label} <ExternalLink size={11} className="opacity-50" />
                  </span>
                  <span className="text-xs font-body text-dark-muted/60 mt-0.5">{l.desc}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal" style={{ transitionDelay: '0.3s' }}>
          <h4 className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-4">Stay in the loop</h4>
          <p className="text-xs font-body text-dark-muted mb-3 leading-relaxed">
            New bots, benefits intel, and the occasional thing HR forgot to tell you.
          </p>
          <NewsletterCapture />
        </div>
      </div>

      <div className="border-t border-dark-border px-4 sm:px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-body text-dark-muted">
            © {new Date().getFullYear()} BeneBots / Infinite Awesome Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs font-body text-dark-muted hover:text-mint transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs font-body text-dark-muted hover:text-mint transition-colors">Terms</Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-xs font-body text-dark-muted hover:text-mint transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
