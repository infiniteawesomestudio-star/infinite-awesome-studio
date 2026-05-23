import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'

const stats = [
  { value: '6', label: 'specialized agents, one shared client profile' },
  { value: '40 min', label: 'stewardship report, down from six hours' },
  { value: '0', label: 'generic answers. Every response cites the plan' },
]

const BOT_FACES = [
  { color: '#00C47A', label: 'Ask', delay: '0s', slug: 'ask', image: '/HSABot_TP.png' },
  { color: '#5B8FFF', label: 'Reports', delay: '1s', slug: 'stewardship', image: '/ComplianceBot_TP.png' },
  { color: '#F7D154', label: 'Compare', delay: '2s', slug: 'plan-compare', image: '/CompareBot_TP.png' },
  { color: '#FF6F61', label: 'OE', delay: '0.5s', slug: 'oe-coach', image: '/OEBot_TP.png' },
  { color: '#A78BFA', label: 'LOA', delay: '1.5s', slug: 'loa-navigator', image: '/LOABot_TP.png' },
  { color: '#F97316', label: 'Claims', delay: '2.5s', slug: 'claims-compass', image: '/ClaimBot_TP.png' },
]

function BotFace({ color, label, delay, image, size = 56 }: { color: string; label: string; delay: string; image: string; size?: number }) {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg animate-float"
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}22`,
        border: `1.5px solid ${color}55`,
        animationDelay: delay,
        boxShadow: `0 0 20px ${color}30`,
      }}
      aria-label={label}
    >
      <img src={image} alt={label} className="w-full h-full object-contain p-1" />
    </div>
  )
}

export default function Hero() {
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
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid pt-16"
      aria-label="Hero"
    >
      <div className="absolute top-20 left-1/4 w-[600px] h-[600px] glow-blob-mint opacity-60 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] glow-blob-blue opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Copy */}
        <div>
          <div className="reveal inline-flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            <span className="text-xs font-body text-dark-muted uppercase tracking-widest">Set it and forget it</span>
          </div>

          <h1 className="reveal font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-dark-text leading-tight mb-5" style={{ transitionDelay: '0.1s' }}>
            For teams that don&apos;t want to{' '}
            <span className="text-gradient">manually prompt AI</span>
            <span className="block mt-1">every Monday.</span>
          </h1>

          <p className="reveal text-base sm:text-lg font-body text-dark-muted leading-relaxed mb-8 max-w-lg" style={{ transitionDelay: '0.2s' }}>
            Or want specialized automation that fits your exact workflow. Six BeneBots, each grounded in your client&apos;s actual plan data. Runs 24/7. No manual prompting. Just approve the output.
          </p>

          <div className="reveal flex flex-wrap gap-3 mb-12" style={{ transitionDelay: '0.3s' }}>
            <button
              onClick={() => navigate('/demo/ask')}
              className="inline-flex items-center gap-2 bg-mint text-deep-forest font-display font-semibold px-6 py-3 rounded-xl hover:bg-[#00a868] transition-colors shadow-lg shadow-mint/25 text-sm"
            >
              See a Live Demo →
            </button>
            <a
              href="mailto:ty@infiniteawesomestudio.com"
              className="inline-flex items-center gap-2 text-dark-text border border-dark-border font-body font-medium px-6 py-3 rounded-xl hover:border-mint/40 hover:text-mint transition-all text-sm"
            >
              <Calendar size={16} /> Schedule a call
            </a>
          </div>

          {/* Stats */}
          <div className="reveal grid grid-cols-3 gap-4" style={{ transitionDelay: '0.4s' }}>
            {stats.map(s => (
              <div key={s.label} className="text-center sm:text-left">
                <div className="font-display font-bold text-2xl text-mint">{s.value}</div>
                <div className="text-xs font-body text-dark-muted leading-tight mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Bot constellation — 5 bots */}
        <div className="relative flex items-center justify-center h-80 lg:h-auto" aria-hidden="true">
          <div className="relative animate-float" style={{ animationDuration: '5s' }}>
            <div
              className="w-28 h-28 rounded-3xl flex items-center justify-center glow-mint p-3"
              style={{
                backgroundColor: 'rgba(0,196,122,0.12)',
                border: '2px solid rgba(0,196,122,0.35)',
              }}
            >
              <img src="/benebots-logo.png" alt="BeneBots" className="w-full h-full object-contain" />
            </div>
          </div>

          {BOT_FACES.map((b, i) => {
            const angle = (i / BOT_FACES.length) * 2 * Math.PI - Math.PI / 2
            const r = 148
            const x = Math.cos(angle) * r
            const y = Math.sin(angle) * r
            return (
              <div
                key={b.label}
                className="absolute"
                style={{ left: '50%', top: '50%', transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
              >
                <BotFace color={b.color} label={b.label} delay={b.delay} image={b.image} />
              </div>
            )
          })}

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
            viewBox="0 0 320 320"
            preserveAspectRatio="xMidYMid meet"
          >
            <g transform="translate(160,160)">
              {BOT_FACES.map((b, i) => {
                const angle = (i / BOT_FACES.length) * 2 * Math.PI - Math.PI / 2
                const r = 140
                return (
                  <line
                    key={i}
                    x1={0} y1={0}
                    x2={Math.cos(angle) * r}
                    y2={Math.sin(angle) * r}
                    stroke={b.color}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                )
              })}
            </g>
          </svg>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50" aria-hidden="true">
        <div className="w-px h-8 bg-gradient-to-b from-mint/60 to-transparent animate-pulse" />
        <span className="text-[10px] font-body text-dark-muted uppercase tracking-widest">Scroll</span>
      </div>
    </section>
  )
}
