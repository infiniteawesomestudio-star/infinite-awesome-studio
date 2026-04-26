import { useEffect, useRef } from 'react'
import { Quote } from 'lucide-react'

interface Testimonial {
  quote: string
  name: string
  title: string
  company: string
  stat?: string
  statLabel?: string
  color: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      "My clients now get answers at 11pm on a Sunday. That's the bot. I used to lose two hours every Monday morning catching up on the weekend questions — that time is mine again.",
    name: 'Sarah M.',
    title: 'Senior Benefits Broker',
    company: 'Regional brokerage, 40+ clients',
    stat: '2 hrs',
    statLabel: 'reclaimed every Monday morning',
    color: '#00C47A',
  },
  {
    quote:
      'The Stewardship Studio draft was better than what my team typically produces in three hours. We edited it, added our logo, and sent it. Done. That\'s not a joke — that\'s literally what happened.',
    name: 'Priya K.',
    title: 'Account Manager',
    company: 'Benefits consulting firm',
    stat: '40 min',
    statLabel: 'stewardship report — down from 6 hours',
    color: '#5B8FFF',
  },
  {
    quote:
      'Open enrollment used to mean all-hands-on-deck for three weeks. Ask BeneBot fielded the obvious questions so my team could actually answer the hard ones. That\'s the whole value proposition, right there.',
    name: 'Marcus T.',
    title: 'Director of HR',
    company: 'Light manufacturer, 450 employees',
    stat: '70%',
    statLabel: 'of OE questions handled before HR inbox',
    color: '#F7D154',
  },
  {
    quote:
      "I'm a benefits account manager who learned to code. BeneBots is the tool I wish existed ten years ago — so I built it. Domain experts who direct AI produce something a generic prompt engineer cannot.",
    name: 'Ty Mosher',
    title: 'Founder, BeneBots',
    company: 'Employee Benefits AM · USI Insurance Services · 20 years',
    color: '#FF6F61',
  },
]

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <article
      className="reveal card-lift bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col gap-4"
      style={{ transitionDelay: `${index * 0.1}s`, borderTopColor: `${t.color}44`, borderTopWidth: '2px' }}
      aria-label={`Testimonial from ${t.name}`}
    >
      <Quote size={20} style={{ color: t.color, opacity: 0.6 }} aria-hidden="true" />

      <blockquote className="flex-1">
        <p className="text-sm font-body text-dark-muted leading-relaxed italic">"{t.quote}"</p>
      </blockquote>

      {t.stat && (
        <div className="flex items-baseline gap-2 py-3 border-y border-dark-border">
          <span className="font-display font-bold text-2xl" style={{ color: t.color }}>{t.stat}</span>
          <span className="text-xs font-body text-dark-muted">{t.statLabel}</span>
        </div>
      )}

      <footer>
        <p className="font-body font-semibold text-sm text-dark-text">{t.name}</p>
        <p className="text-xs font-body text-dark-muted mt-0.5">{t.title}</p>
        <p className="text-xs font-body text-dark-muted">{t.company}</p>
      </footer>
    </article>
  )
}

export default function Testimonials() {
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
    <section ref={sectionRef} id="testimonials" className="py-24 bg-dark-surface" aria-labelledby="testimonials-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-1.5 mb-5">
            <span className="text-xs font-body text-mint uppercase tracking-widest">Proof Points</span>
          </div>
          <h2 id="testimonials-heading" className="reveal font-display font-bold text-3xl sm:text-4xl text-dark-text mb-4" style={{ transitionDelay: '0.1s' }}>
            What happens when the bot takes the call
          </h2>
          <p className="reveal text-base font-body text-dark-muted max-w-xl mx-auto" style={{ transitionDelay: '0.2s' }}>
            Brokers and HR teams who stopped answering the same question twice.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>

        {/* GTM closing line as a standalone pull quote */}
        <div className="reveal mt-10 border border-dark-border rounded-2xl p-8 text-center" style={{ transitionDelay: '0.5s' }}>
          <p className="font-display font-bold text-xl sm:text-2xl text-dark-text max-w-2xl mx-auto leading-snug">
            "The moat is the person writing the prompts. Twenty years of pattern recognition — turned into software."
          </p>
          <p className="text-sm font-body text-mint mt-4">BeneBots — Benefits Without Boundaries</p>
        </div>
      </div>
    </section>
  )
}
