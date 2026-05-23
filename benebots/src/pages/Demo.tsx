import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AskDemo from '../demo/AskDemo'
import StewardshipDemo from '../demo/StewardshipDemo'
import PlanCompareDemo from '../demo/PlanCompareDemo'
import OECoachDemo from '../demo/OECoachDemo'
import LOANavigatorDemo from '../demo/LOANavigatorDemo'

const BOT_META: Record<string, { name: string; color: string; tagline: string; image: string }> = {
  ask: { name: 'Ask BeneBot', color: '#00C47A', tagline: 'Employee Q&A, grounded in Acme\'s plans', image: '/HSABot_TP.png' },
  stewardship: { name: 'Stewardship Studio', color: '#5B8FFF', tagline: 'Renewal report drafter, Acme claims data pre-loaded', image: '/ComplianceBot_TP.png' },
  'plan-compare': { name: 'Plan Compare', color: '#F7D154', tagline: 'HDHP vs PPO with Acme\'s actual numbers', image: '/CompareBot_TP.png' },
  'oe-coach': { name: 'OE Coach', color: '#FF6F61', tagline: 'Personalized plan recommendation, Acme plans', image: '/OEBot_TP.png' },
  'loa-navigator': { name: 'LOA Navigator', color: '#A78BFA', tagline: 'Leave guide for FMLA, CA/NY/WA, parental leave', image: '/LOABot_TP.png' },
}

export default function Demo() {
  const { botId } = useParams<{ botId: string }>()
  const meta = botId ? BOT_META[botId] : undefined

  if (!meta) {
    return (
      <div className="min-h-screen bg-dark-base text-dark-text flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-16">
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-dark-text mb-3">Bot not found.</p>
            <Link to="/" className="text-mint text-sm font-body hover:underline">← Back to BeneBots</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isChat = botId === 'ask'

  return (
    <div className="h-screen bg-dark-base text-dark-text flex flex-col overflow-hidden">
      <Navbar />

      {/* Demo header */}
      <div className="pt-16 border-b border-dark-border bg-dark-surface flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
              style={{ backgroundColor: `${meta.color}1a`, border: `1.5px solid ${meta.color}44` }}
            >
              <img src={meta.image} alt={meta.name} className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-dark-text text-lg leading-tight">{meta.name}</h1>
              <p className="text-xs font-body text-dark-muted">{meta.tagline}</p>
            </div>
            <span
              className="text-[10px] font-body font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: `${meta.color}12`, color: meta.color, borderColor: `${meta.color}33` }}
            >
              Demo mode | Acme Industries
            </span>
          </div>
          <Link
            to="/"
            className="text-xs font-body text-dark-muted hover:text-mint transition-colors flex items-center gap-1"
          >
            ← Back to BeneBots
          </Link>
        </div>
      </div>

      {/* Demo interface — scrollable for non-chat bots, fixed for chat */}
      <main className={`flex-1 min-h-0 ${isChat ? 'flex flex-col' : 'overflow-y-auto'}`}>
        <div className={`max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 ${isChat ? 'flex-1 flex flex-col min-h-0' : ''}`}>
          {botId === 'ask' && <AskDemo />}
          {botId === 'stewardship' && <StewardshipDemo />}
          {botId === 'plan-compare' && <PlanCompareDemo />}
          {botId === 'oe-coach' && <OECoachDemo />}
          {botId === 'loa-navigator' && <LOANavigatorDemo />}
        </div>
      </main>
    </div>
  )
}
