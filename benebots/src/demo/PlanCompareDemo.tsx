import { useState } from 'react'
import { useClient } from '../client/ClientContext'
import type { Client } from '../data/demoProfile'
import ExportBar from '../components/ExportBar'

type Profile = 'low' | 'family' | 'chronic'

interface Scenario {
  label: string
  description: string
  annualMedicalCost: number
  visits: number
}

const PROFILES: Record<Profile, Scenario> = {
  low: {
    label: 'Low utilizer',
    description: 'Annual physical, one urgent care visit. No prescriptions.',
    annualMedicalCost: 800,
    visits: 2,
  },
  family: {
    label: 'Family with expected care',
    description: 'Two kids, OB/GYN, 6–8 visits/year, one specialist, moderate Rx.',
    annualMedicalCost: 9000,
    visits: 10,
  },
  chronic: {
    label: 'Chronic condition',
    description: 'Ongoing specialist care, regular Rx, possible outpatient procedure.',
    annualMedicalCost: 22000,
    visits: 18,
  },
}

function buildWatchouts(p: Client): Record<Profile, string> {
  const seed = p.hsa.employerSeed.toLocaleString()
  return {
    low: `Low utilizers almost always come out ahead on the HDHP. The $${seed} employer HSA seed covers their typical spend and rolls over. The PPO's higher premium is the hidden cost here.`,
    family: `Families with predictable care need to compare the family deductible ($${p.medical.hdhp.deductible.family.toLocaleString()} HDHP vs $${p.medical.ppo.deductible.family.toLocaleString()} PPO) against the $${seed} HSA seed. If they max the HSA, the math often favors HDHP, but cash flow matters. The HDHP asks you to fund the deductible before insurance kicks in.`,
    chronic: `High utilizers will hit the OOPM on both plans. The question is which OOPM they hit first and what their premium difference looks like. If they reach the HDHP OOPM ($${p.medical.hdhp.oopm.individual.toLocaleString()}), the employer HSA seed softens the gap. PPO's lower OOPM ($${p.medical.ppo.oopm.individual.toLocaleString()}) matters most here.`,
  }
}

// Simplified cost math using the active client's plan parameters
function calcHDHP(DEMO_PROFILE: Client, annualMedCost: number): { ded: number; coins: number; oopm: number; total: number; hsa: number } {
  const ded = DEMO_PROFILE.medical.hdhp.deductible.individual
  const oopm = DEMO_PROFILE.medical.hdhp.oopm.individual
  const employer = DEMO_PROFILE.hsa.employerSeed

  const afterDed = Math.max(0, annualMedCost - ded)
  const coins = Math.min(afterDed * 0.2, oopm - ded)
  const memberCost = Math.min(annualMedCost, oopm)
  return { ded, coins, oopm, total: memberCost - employer, hsa: employer }
}

function calcPPO(DEMO_PROFILE: Client, annualMedCost: number): { ded: number; copays: number; coins: number; total: number } {
  const ded = DEMO_PROFILE.medical.ppo.deductible.individual
  const oopm = DEMO_PROFILE.medical.ppo.oopm.individual
  // Simplify: copays cover first visits before deductible applies in PPO
  const copayEstimate = 4 * DEMO_PROFILE.medical.ppo.primaryCareCopay + 2 * DEMO_PROFILE.medical.ppo.specialistCopay
  const afterDedRemainder = Math.max(0, annualMedCost - ded - copayEstimate)
  const coins = Math.min(afterDedRemainder * 0.2, oopm - ded)
  const memberCost = Math.min(copayEstimate + ded + coins, oopm)
  return { ded, copays: copayEstimate, coins, total: memberCost }
}

export default function PlanCompareDemo() {
  const DEMO_PROFILE = useClient()
  const [profile, setProfile] = useState<Profile>('family')
  const hdhp = calcHDHP(DEMO_PROFILE, PROFILES[profile].annualMedicalCost)
  const ppo = calcPPO(DEMO_PROFILE, PROFILES[profile].annualMedicalCost)
  const { medical } = DEMO_PROFILE
  const WATCHOUTS = buildWatchouts(DEMO_PROFILE)
  const seedLabel = DEMO_PROFILE.hsa.employerSeed.toLocaleString()

  const buildMarkdown = () => {
    const s = PROFILES[profile]
    return `# ${DEMO_PROFILE.companyName} — Plan Comparison

**Employee profile:** ${s.label} — ${s.description}

| Metric | ${medical.hdhp.name} | ${medical.ppo.name} |
|---|---|---|
| Individual deductible | $${medical.hdhp.deductible.individual.toLocaleString()} | $${medical.ppo.deductible.individual.toLocaleString()} |
| Cost sharing | ${medical.hdhp.coinsurance} | $${medical.ppo.primaryCareCopay} PCP / $${medical.ppo.specialistCopay} specialist |
| Out-of-pocket max | $${medical.hdhp.oopm.individual.toLocaleString()} | $${medical.ppo.oopm.individual.toLocaleString()} |
| Employer HSA seed | $${DEMO_PROFILE.hsa.employerSeed.toLocaleString()} | — |
| **Est. member cost (this profile)** | **$${Math.max(0, hdhp.total).toLocaleString()}** | **$${ppo.total.toLocaleString()}** |

**Watch-outs:** ${WATCHOUTS[profile]}

_Estimates are illustrative and based on ${DEMO_PROFILE.companyName} plan parameters. Actual costs depend on services, network status, and Rx usage._
`
  }

  return (
    <div className="space-y-6">
      {/* Profile selector */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
        <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-3">Employee profile</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {(Object.entries(PROFILES) as [Profile, Scenario][]).map(([key, s]) => (
            <button
              key={key}
              onClick={() => setProfile(key)}
              className={`text-left px-4 py-3 rounded-xl border text-sm font-body transition-all ${
                profile === key
                  ? 'border-[#F7D154]/60 bg-[#F7D154]/8 text-dark-text'
                  : 'border-dark-border text-dark-muted hover:border-[#F7D154]/30'
              }`}
            >
              <span className="font-semibold block text-dark-text mb-0.5">{s.label}</span>
              {s.description}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* HDHP */}
        <div className="bg-dark-card border border-[#00C47A]/30 rounded-2xl p-5 space-y-4">
          <div>
            <p className="font-display font-bold text-dark-text text-base">{medical.hdhp.name}</p>
            <p className="text-xs font-body text-dark-muted mt-0.5">Lower premium, higher deductible. Pairs with HSA</p>
          </div>
          <div className="space-y-2 text-sm font-body">
            <Row label="Individual deductible" value={`$${medical.hdhp.deductible.individual.toLocaleString()}`} />
            <Row label="Coinsurance" value={medical.hdhp.coinsurance} />
            <Row label="Out-of-pocket max" value={`$${medical.hdhp.oopm.individual.toLocaleString()}`} />
            <Row label="Employer HSA seed" value={`$${DEMO_PROFILE.hsa.employerSeed.toLocaleString()}`} highlight />
          </div>
          <div className="border-t border-dark-border pt-4 space-y-1">
            <p className="text-xs font-body text-dark-muted uppercase tracking-widest">Est. member cost this profile</p>
            <p className="font-display font-bold text-2xl text-[#00C47A]">${Math.max(0, hdhp.total).toLocaleString()}</p>
            <p className="text-xs font-body text-dark-muted">after ${seedLabel} employer HSA seed applied</p>
          </div>
        </div>

        {/* PPO */}
        <div className="bg-dark-card border border-[#F7D154]/30 rounded-2xl p-5 space-y-4">
          <div>
            <p className="font-display font-bold text-dark-text text-base">{medical.ppo.name}</p>
            <p className="text-xs font-body text-dark-muted mt-0.5">Copays from dollar one, higher premium</p>
          </div>
          <div className="space-y-2 text-sm font-body">
            <Row label="Individual deductible" value={`$${medical.ppo.deductible.individual.toLocaleString()}`} />
            <Row label="PCP copay" value={`$${medical.ppo.primaryCareCopay}`} />
            <Row label="Specialist copay" value={`$${medical.ppo.specialistCopay}`} />
            <Row label="Out-of-pocket max" value={`$${medical.ppo.oopm.individual.toLocaleString()}`} />
          </div>
          <div className="border-t border-dark-border pt-4 space-y-1">
            <p className="text-xs font-body text-dark-muted uppercase tracking-widest">Est. member cost this profile</p>
            <p className="font-display font-bold text-2xl text-[#F7D154]">${ppo.total.toLocaleString()}</p>
            <p className="text-xs font-body text-dark-muted">copays + deductible + coinsurance</p>
          </div>
        </div>
      </div>

      {/* Watch-outs */}
      <div className="bg-dark-base border border-dark-border rounded-2xl p-5">
        <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-3">Watch-outs for this profile</p>
        <p className="text-sm font-body text-dark-muted leading-relaxed">{WATCHOUTS[profile]}</p>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <ExportBar
          getContent={buildMarkdown}
          filename={`${DEMO_PROFILE.companyName.replace(/\s+/g, '-')}-plan-compare-${profile}.md`}
          accent="#F7D154"
          note="Markdown comparison for this profile"
        />
      </div>

      <p className="text-[10px] font-body text-dark-muted text-center">
        Cost estimates are illustrative and based on {DEMO_PROFILE.companyName} plan parameters. Actual costs depend on specific services, network status, and Rx usage.
      </p>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-dark-muted">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-[#00C47A]' : 'text-dark-text'}`}>{value}</span>
    </div>
  )
}
