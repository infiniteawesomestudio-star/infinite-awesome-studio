import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, FileText, Scale, Compass, Navigation } from 'lucide-react'

interface Bot {
  icon: React.ElementType
  name: string
  tagline: string
  description: string
  color: string
  tasks: string[]
  slug: string
}

const bots: Bot[] = [
  {
    icon: MessageSquare,
    name: 'Ask BeneBot',
    tagline: 'Every plan detail, plain language',
    description:
      'Answers employee benefits questions grounded in your client\'s actual plan. Cites the SPD page. Admits when the answer isn\'t there.',
    color: '#00C47A',
    tasks: [
      'Deductible & copay lookups',
      'HSA contribution limits',
      'In/out-of-network guidance',
      'COBRA eligibility',
    ],
    slug: 'ask',
  },
  {
    icon: FileText,
    name: 'Stewardship Studio',
    tagline: 'Broker-quality narratives in 40 minutes',
    description:
      'Seven report section types, each anchored in the client\'s actual claims and enrollment data. Markdown output that copies cleanly into Word or PowerPoint.',
    color: '#5B8FFF',
    tasks: [
      'Executive summary',
      'Claims & utilization analysis',
      'Market benchmarking',
      'Strategic recommendations',
    ],
    slug: 'stewardship',
  },
  {
    icon: Scale,
    name: 'Plan Compare',
    tagline: 'Side-by-side, with the math shown',
    description:
      'Two or three plans, structured comparison with real cost scenarios by employee profile: low utilizer, family with expected care, chronic condition. Includes honest watch-outs.',
    color: '#F7D154',
    tasks: [
      'Medical plan comparison',
      'Cost scenarios by profile',
      'HSA vs FSA guidance',
      'Renewal strategy support',
    ],
    slug: 'plan-compare',
  },
  {
    icon: Compass,
    name: 'OE Coach',
    tagline: 'Open enrollment, one step at a time',
    description:
      'A short questionnaire covering coverage tier, expected care, prescriptions, and budget. Returns a personalized plan recommendation, HSA/FSA contribution strategy, and the one trade-off they\'re making.',
    color: '#FF6F61',
    tasks: [
      'Plan recommendation by profile',
      'HSA/FSA contribution strategy',
      '"Don\'t forget" elections',
      'Trade-off plain language',
    ],
    slug: 'oe-coach',
  },
  {
    icon: Navigation,
    name: 'LOA Navigator',
    tagline: 'Leave policy, state by state',
    description:
      'Dual-mode: employee-facing education and HR admin checklist. Covers FMLA, state paid leave (CA/NY/WA), parental leave, STD/LTD integration. Every response ends with "what to ask HR."',
    color: '#A78BFA',
    tasks: [
      'FMLA & state leave education',
      'Employee vs HR admin mode',
      'STD/LTD integration guidance',
      '"What to ask HR" checklist',
    ],
    slug: 'loa-navigator',
  },
]

function BotCard({ bot, index }: { bot: Bot; index: number }) {
  const navigate = useNavigate()
  const Icon = bot.icon
  return (
    <article
      className="reveal card-lift bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col gap-4 cursor-pointer group transition-all hover:border-opacity-60"
      style={{
        transitionDelay: `${index * 0.1}s`,
        borderLeftColor: `${bot.color}44`,
        borderLeftWidth: '3px',
      }}
      onClick={() => navigate(`/demo/${bot.slug}`)}
      aria-label={`${bot.name}, try the demo`}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/demo/${bot.slug}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105"
          style={{ backgroundColor: `${bot.color}1a`, border: `1px solid ${bot.color}33` }}
        >
          <Icon size={20} style={{ color: bot.color }} />
        </div>
        <span
          className="text-[10px] font-body font-semibold uppercase tracking-widest px-2 py-1 rounded-full"
          style={{ backgroundColor: `${bot.color}18`, color: bot.color }}
        >
          BeneBot
        </span>
      </div>

      <div>
        <h3 className="font-display font-bold text-lg text-dark-text mb-1">{bot.name}</h3>
        <p className="text-xs font-body text-dark-muted mb-3 uppercase tracking-wide">{bot.tagline}</p>
        <p className="text-sm font-body text-dark-muted leading-relaxed">{bot.description}</p>
      </div>

      <ul className="mt-auto space-y-1.5">
        {bot.tasks.map(t => (
          <li key={t} className="flex items-center gap-2 text-xs font-body text-dark-muted">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: bot.color }} />
            {t}
          </li>
        ))}
      </ul>

      <div className="pt-1 border-t border-dark-border">
        <span
          className="text-xs font-body font-medium transition-colors"
          style={{ color: bot.color }}
        >
          See it in action →
        </span>
      </div>
    </article>
  )
}

export default function Features() {
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
    <section ref={sectionRef} id="features" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto" aria-labelledby="features-heading">
      <div className="text-center mb-16">
        <div className="reveal inline-flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-1.5 mb-5">
          <span className="text-xs font-body text-mint uppercase tracking-widest">Five Agents, One Platform</span>
        </div>
        <h2 id="features-heading" className="reveal font-display font-bold text-3xl sm:text-4xl text-dark-text mb-4" style={{ transitionDelay: '0.1s' }}>
          A BeneBot for every job in the stack
        </h2>
        <p className="reveal text-base font-body text-dark-muted max-w-xl mx-auto leading-relaxed" style={{ transitionDelay: '0.2s' }}>
          Each agent handles a specific function, grounded in your client's actual plan data, not generic insurance content.
          Click any card to see a live demo with Acme Industries data.
        </p>
      </div>

      {/* 2+3 grid — 5 bots */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {bots.map((bot, i) => (
          <BotCard key={bot.name} bot={bot} index={i} />
        ))}
      </div>

      {/* Proof point callout */}
      <div className="reveal mt-14 bg-dark-card border border-dark-border rounded-2xl p-8 grid sm:grid-cols-3 gap-6 text-center" style={{ transitionDelay: '0.5s' }}>
        <div>
          <p className="font-display font-bold text-2xl text-mint mb-1">40 minutes</p>
          <p className="text-sm font-body text-dark-muted">stewardship report that used to take six hours</p>
        </div>
        <div className="hidden sm:block w-px bg-dark-border self-stretch" aria-hidden="true" />
        <div>
          <p className="font-display font-bold text-2xl text-dark-text mb-1">Grounded, not guessing</p>
          <p className="text-sm font-body text-dark-muted">every response cites the actual client plan</p>
        </div>
        <div className="hidden sm:block w-px bg-dark-border self-stretch" aria-hidden="true" />
        <div>
          <p className="font-display font-bold text-2xl text-coral mb-1">Every benefit. Every penny.</p>
          <p className="text-sm font-body text-dark-muted">no generic answers, grounded in your client data</p>
        </div>
      </div>
    </section>
  )
}
