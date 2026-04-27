import { useState, useEffect, useRef } from 'react'
import { Send, ExternalLink, Calendar } from 'lucide-react'

const CONTACT_EMAIL = 'ty@infiniteawesomestudio.com'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
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
          _subject: 'BeneBots — New consultation request',
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
          <p className="font-display font-bold text-dark-text text-lg mb-1">Got it — we'll be in touch.</p>
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
      body: JSON.stringify({ email, _subject: 'BeneBots — Newsletter signup', type: 'newsletter' }),
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
              Tell us what's on your plate. We'll scope the right BeneBot — no deck, no pressure, just a real conversation about where your team is spending time it shouldn't be.
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
            <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center">
              <span className="text-dark-base font-display font-bold text-sm">B</span>
            </div>
            <span className="font-display font-bold text-dark-text text-lg">
              Bene<span className="text-mint">Bots</span>
            </span>
          </a>
          <p className="text-xs font-body text-dark-muted leading-relaxed max-w-[220px]">
            AI agents for benefits administration. Every benefit. Every penny.
          </p>
          <p className="text-xs font-body text-dark-muted mt-4">
            Built by{' '}
            <a href="https://infiniteawesome.studio" target="_blank" rel="noopener noreferrer" className="text-mint hover:underline">
              Infinite Awesome Studio
            </a>
          </p>
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
            <a href="/privacy" className="text-xs font-body text-dark-muted hover:text-mint transition-colors">Privacy</a>
            <a href="/terms" className="text-xs font-body text-dark-muted hover:text-mint transition-colors">Terms</a>
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
