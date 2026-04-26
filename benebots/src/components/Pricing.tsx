import { useEffect, useRef } from 'react'
import { Check, ArrowRight } from 'lucide-react'

interface Tier {
  name: string
  badge?: string
  price: string
  period: string
  audience: string
  tagline: string
  features: string[]
  cta: string
  ctaHref: string
  highlight: boolean
  color: string
}

const tiers: Tier[] = [
  {
    name: 'Studio',
    price: '$199',
    period: '/mo',
    audience: 'Solo consultants · boutique brokerages · 1–5 clients',
    tagline: 'Full platform from day one. Start with the bot that solves your biggest problem.',
    features: [
      'Full platform — all 4 agents',
      '5 client profiles',
      'Live Anthropic API',
      'Markdown exports (Word / PowerPoint ready)',
      'Diagnostics suite',
      'Custom system prompts per bot',
    ],
    cta: 'Get Started',
    ctaHref: '#contact',
    highlight: false,
    color: '#00C47A',
  },
  {
    name: 'Agency',
    badge: 'Most Popular',
    price: '$500',
    period: '/client/mo',
    audience: 'Mid-size brokerages · 6–50 clients',
    tagline: 'Multi-user, multi-client. The platform your whole team runs on.',
    features: [
      'Everything in Studio',
      'Unlimited client profiles',
      'Multi-user access',
      'Document ingestion (SPDs, SBCs, COCs)',
      'DOCX / PPTX native export',
      'SSO (Microsoft Entra / Okta)',
      'Dedicated onboarding',
    ],
    cta: 'Talk to Us',
    ctaHref: '#contact',
    highlight: true,
    color: '#5B8FFF',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    audience: 'National brokerages · TPAs · enterprise firms',
    tagline: 'White-label, carrier integrations, custom bots, audit trail.',
    features: [
      'Everything in Agency',
      'White-label option',
      'Carrier data feed integrations',
      'Custom bot development',
      'SOC 2 audit trail',
      'HIPAA-aligned infrastructure',
      'Dedicated success team',
    ],
    cta: 'Schedule a Call',
    ctaHref: '#contact',
    highlight: false,
    color: '#F7D154',
  },
]

const addOns = [
  {
    name: 'Done-for-You Onboarding',
    price: '$2,500',
    unit: 'per client',
    description:
      'We extract plan data from your documents, stand up the client profile, and train your team. Five minutes from kickoff to first useful output.',
  },
  {
    name: 'Custom Bot Development',
    price: '$15K+',
    unit: 'per engagement',
    description:
      'Build a fifth, sixth, or seventh bot for a workflow only you do — renewal strategy, compliance calendar, vendor scorecards. Domain expert meets code.',
  },
]

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const items = el.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    items.forEach(i => io.observe(i))
    return () => io.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="pricing" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto" aria-labelledby="pricing-heading">
      <div className="text-center mb-16">
        <div className="reveal inline-flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-1.5 mb-5">
          <span className="text-xs font-body text-mint uppercase tracking-widest">Pricing</span>
        </div>
        <h2 id="pricing-heading" className="reveal font-display font-bold text-3xl sm:text-4xl text-dark-text mb-4" style={{ transitionDelay: '0.1s' }}>
          Pick your starting point
        </h2>
        <p className="reveal text-base font-body text-dark-muted max-w-xl mx-auto leading-relaxed" style={{ transitionDelay: '0.2s' }}>
          Every tier runs on the same platform — four agents, one shared client profile, live model, diagnostics suite.
          Scale up as your book of business grows.
        </p>
      </div>

      {/* Tier grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {tiers.map((tier, i) => (
          <article
            key={tier.name}
            className={`reveal card-lift flex flex-col rounded-2xl border p-7 ${
              tier.highlight
                ? 'bg-dark-card-hover border-mint/40 shadow-xl shadow-mint/10'
                : 'bg-dark-card border-dark-border'
            }`}
            style={{ transitionDelay: `${i * 0.12}s` }}
            aria-label={`${tier.name} pricing tier`}
          >
            {tier.badge && (
              <div className="mb-4">
                <span
                  className="inline-flex items-center text-[10px] font-display font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${tier.color}22`, color: tier.color }}
                >
                  {tier.badge}
                </span>
              </div>
            )}

            <div className="mb-3">
              <h3 className="font-display font-bold text-2xl text-dark-text mb-1">{tier.name}</h3>
              <p className="text-[11px] font-body text-dark-muted leading-snug">{tier.audience}</p>
            </div>

            <div className="mb-3 flex items-baseline gap-1">
              <span className="font-display font-bold text-3xl text-dark-text">{tier.price}</span>
              {tier.period && <span className="text-sm font-body text-dark-muted">{tier.period}</span>}
            </div>

            <p className="text-sm font-body text-dark-muted mb-6 leading-relaxed">{tier.tagline}</p>

            <hr className="section-divider mb-6" />

            <ul className="flex-1 space-y-3 mb-8">
              {tier.features.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm font-body text-dark-muted">
                  <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href={tier.ctaHref}
              className={`inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl font-display font-semibold text-sm transition-all ${
                tier.highlight
                  ? 'bg-mint text-deep-forest hover:bg-[#00a868] shadow-lg shadow-mint/25'
                  : 'border border-dark-border text-dark-text hover:border-mint/40 hover:text-mint'
              }`}
            >
              {tier.cta} <ArrowRight size={15} />
            </a>
          </article>
        ))}
      </div>

      {/* Add-ons */}
      <div className="reveal" style={{ transitionDelay: '0.4s' }}>
        <p className="text-xs font-body text-dark-muted uppercase tracking-widest text-center mb-5">Add-on services</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {addOns.map(a => (
            <div key={a.name} className="bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-display font-bold text-dark-text">{a.name}</h4>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold text-mint text-lg">{a.price}</p>
                  <p className="text-[11px] font-body text-dark-muted">{a.unit}</p>
                </div>
              </div>
              <p className="text-sm font-body text-dark-muted leading-relaxed">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
