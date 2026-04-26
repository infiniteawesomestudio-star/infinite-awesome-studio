import { useEffect, useRef } from 'react'
import { Search, Cpu, Rocket } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Assessment',
    subtitle: 'We map your benefits stack',
    description:
      "We dig into your client profiles — plans, carriers, claims data, and the deliverables your team produces on repeat. Then we identify exactly where an agent takes the wheel.",
    color: '#00C47A',
    bullets: ['Benefits inventory audit', 'Workflow mapping session', 'Bot fit analysis', 'Client data review'],
  },
  {
    number: '02',
    icon: Cpu,
    title: 'Design',
    subtitle: 'Built to your spec, grounded in your data',
    description:
      "Each BeneBot is trained on your actual client plan data — not generic insurance content. We design the persona, the guardrails, and the system prompt. Pure-function prompts: easy to test, easy to override, easy to version.",
    color: '#5B8FFF',
    bullets: ['Custom plan data ingestion', 'Persona + tone calibration', 'Compliance guardrails', 'Diagnostics suite setup'],
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Deployment',
    subtitle: 'Live in your environment',
    description:
      "Embedded in your client portal, your HR hub, or wherever employees actually land. Every bot output exports to Markdown for copy into Word, PowerPoint, or Notion. Run the diagnostics suite before any client demo.",
    color: '#FF6F61',
    bullets: ['Embedded deployment', 'Staff training session', 'Diagnostics suite handoff', 'First-month monitoring'],
  },
]

export default function HowItWorks() {
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
    <section ref={sectionRef} id="how-it-works" className="py-24 bg-dark-surface" aria-labelledby="how-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-1.5 mb-5">
            <span className="text-xs font-body text-mint uppercase tracking-widest">The Process</span>
          </div>
          <h2 id="how-heading" className="reveal font-display font-bold text-3xl sm:text-4xl text-dark-text mb-4" style={{ transitionDelay: '0.1s' }}>
            From first call to live bot
          </h2>
          <p className="reveal text-base font-body text-dark-muted max-w-lg mx-auto leading-relaxed" style={{ transitionDelay: '0.2s' }}>
            No six-month implementations. No hand-wavy promises. A real agent, deployed in your environment, doing real work — grounded in your actual client data.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div
            className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px opacity-30"
            style={{ background: 'linear-gradient(90deg, #00C47A, #5B8FFF, #FF6F61)' }}
            aria-hidden="true"
          />

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <article
                key={step.title}
                className="reveal flex flex-col gap-5"
                style={{ transitionDelay: `${i * 0.15}s` }}
                aria-label={`Step ${step.number}: ${step.title}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                    style={{ backgroundColor: `${step.color}18`, border: `1.5px solid ${step.color}44` }}
                  >
                    <Icon size={22} style={{ color: step.color }} />
                  </div>
                  <span
                    className="font-display font-bold text-4xl opacity-20"
                    style={{ color: step.color }}
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-xl text-dark-text mb-1">{step.title}</h3>
                  <p className="text-xs font-body uppercase tracking-wider mb-3" style={{ color: step.color }}>{step.subtitle}</p>
                  <p className="text-sm font-body text-dark-muted leading-relaxed mb-4">{step.description}</p>

                  <ul className="space-y-2">
                    {step.bullets.map(b => (
                      <li key={b} className="flex items-center gap-2 text-xs font-body text-dark-muted">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: step.color }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          })}
        </div>

        {/* Diagnostics callout — from architecture doc */}
        <div className="reveal mt-16 border border-mint/20 bg-dark-card rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left" style={{ transitionDelay: '0.4s' }}>
          <div className="w-12 h-12 rounded-xl bg-mint/10 border border-mint/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xl" role="img" aria-label="Test tube">🧪</span>
          </div>
          <div>
            <p className="font-display font-bold text-dark-text mb-0.5">Built-in Diagnostics Suite</p>
            <p className="text-sm font-body text-dark-muted">
              Five tests that hit the live model and assert on output properties — structure, numeric grounding, refusal behavior.
              Run before every client demo. Run after every prompt change. Know your bots still work.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
