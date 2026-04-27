import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const USE_TYPES = [
  {
    audience: 'Independent consultants',
    color: '#00C47A',
    items: [
      'Ask BeneBot + OE Coach for employee-facing support during OE',
      'Stewardship Studio for renewal prep — draft the narrative in 40 minutes',
      'Grounded in each client\'s specific plan data, not generic content',
      'No IT department required',
    ],
  },
  {
    audience: 'Mid-size brokerages',
    color: '#5B8FFF',
    items: [
      'Full 5-bot suite configured per client',
      'Multi-client management — each client\'s bots know only their own plans',
      'White-label ready for client portal deployment',
      'Diagnostics suite runs before every client demo',
    ],
  },
  {
    audience: 'HR teams',
    color: '#A78BFA',
    items: [
      'Ask BeneBot + LOA Navigator embedded in your HR portal',
      'Custom escalation rules — bots know when to hand off to HR',
      'Grounded in your SPD, not a generic summary',
      'Employee mode and HR admin mode for LOA Navigator',
    ],
  },
]

export default function Capabilities() {
  const sectionRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()

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
    <section ref={sectionRef} id="capabilities" className="py-24 px-4 sm:px-6 bg-dark-surface" aria-labelledby="capabilities-heading">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-1.5 mb-5">
            <span className="text-xs font-body text-mint uppercase tracking-widest">Built for your practice</span>
          </div>
          <h2 id="capabilities-heading" className="reveal font-display font-bold text-3xl sm:text-4xl text-dark-text mb-4" style={{ transitionDelay: '0.1s' }}>
            Built around your clients.{' '}
            <span className="text-gradient">Not a generic chatbot.</span>
          </h2>
          <p className="reveal text-base font-body text-dark-muted max-w-2xl mx-auto leading-relaxed" style={{ transitionDelay: '0.2s' }}>
            Every BeneBot is grounded in the specific plans of the specific client you're working with.
            You choose which bots your practice needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {USE_TYPES.map((ut, i) => (
            <article
              key={ut.audience}
              className="reveal bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col gap-5"
              style={{ transitionDelay: `${i * 0.1}s`, borderTopColor: `${ut.color}55`, borderTopWidth: '2px' }}
            >
              <div>
                <p className="text-xs font-body font-semibold uppercase tracking-widest mb-2" style={{ color: ut.color }}>
                  {ut.audience}
                </p>
              </div>
              <ul className="space-y-3 flex-1">
                {ut.items.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm font-body text-dark-muted leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: ut.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* CTA row */}
        <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4" style={{ transitionDelay: '0.3s' }}>
          <a
            href="mailto:ty@infiniteawesomestudio.com?subject=BeneBots — Tell me what your practice looks like"
            className="inline-flex items-center gap-2 text-dark-text border border-dark-border font-body font-medium px-6 py-3 rounded-xl hover:border-mint/40 hover:text-mint transition-all text-sm"
          >
            Tell me what your practice looks like →
          </a>
          <button
            onClick={() => navigate('/demo/ask')}
            className="inline-flex items-center gap-2 bg-mint text-deep-forest font-display font-semibold px-6 py-3 rounded-xl hover:bg-[#00a868] transition-colors shadow-lg shadow-mint/25 text-sm"
          >
            See any bot in action →
          </button>
        </div>
      </div>
    </section>
  )
}
