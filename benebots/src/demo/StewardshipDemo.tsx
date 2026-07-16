import { useState } from 'react'
import { useClient } from '../client/ClientContext'
import type { Client } from '../data/demoProfile'
import ExportBar from '../components/ExportBar'

type Section =
  | 'executive-summary'
  | 'claims-analysis'
  | 'market-benchmarking'
  | 'strategic-recommendations'

const SECTIONS: { id: Section; label: string; desc: string }[] = [
  { id: 'executive-summary', label: 'Executive Summary', desc: 'High-level narrative for leadership' },
  { id: 'claims-analysis', label: 'Claims & Utilization', desc: 'Cost drivers and trend analysis' },
  { id: 'market-benchmarking', label: 'Market Benchmarking', desc: 'How the client compares to peers' },
  { id: 'strategic-recommendations', label: 'Strategic Recommendations', desc: 'Action items for renewal' },
]

type Claims = Client['stewardshipClaims']

function buildDrafts(DEMO_PROFILE: Client, DEMO_CLAIMS: Claims): Record<Section, string> {
  const co = DEMO_PROFILE.companyName
  const erPer1000 = Math.round(DEMO_CLAIMS.erVisits / (DEMO_CLAIMS.memberMonths / 12) * 1000)
  return {
    'executive-summary': `## Executive Summary | ${co} Plan Year ${DEMO_PROFILE.planYear}

**Prepared for:** ${co} (${DEMO_PROFILE.companySize})

Total plan spend for the period was **$${DEMO_CLAIMS.totalSpend.toLocaleString()}**, or **$${DEMO_CLAIMS.pmpm}/member/month**, tracking 4.2% above prior year. The group is self-funded, with stop-loss protection through ${DEMO_PROFILE.loa.stdCarrier}.

**Three things leadership needs to know:**

1. **${DEMO_CLAIMS.topCostDrivers[2].category} spend is up ${DEMO_CLAIMS.topCostDrivers[2].trend}.** At ${DEMO_CLAIMS.topCostDrivers[2].pct}% of total claims, this is a fast-growing cost driver. It reflects national trends but is accelerating faster than the peer benchmark. A carrier-sponsored audit and network adequacy review are recommended before renewal.

2. **Generic fill rate is strong at ${DEMO_CLAIMS.genericFillRate}%.** Rx management is working. The step-therapy program introduced last renewal cycle is producing measurable savings, estimated at $180,000 in avoidance vs. brand-only utilization.

3. **Preventive compliance sits at ${DEMO_CLAIMS.preventiveCompliance}%.** Leaving $0-deductible, $0-copay value on the table. A targeted communication campaign during the next OE cycle is the lowest-cost intervention with highest potential ROI.

The renewal strategy section covers carrier negotiation positioning, plan design adjustment options, and a three-year trend projection at current trajectory.`,

    'claims-analysis': `## Claims & Utilization Analysis | ${co} ${DEMO_PROFILE.planYear}

**Total medical + Rx spend:** $${DEMO_CLAIMS.totalSpend.toLocaleString()}
**Member months:** ${DEMO_CLAIMS.memberMonths.toLocaleString()}
**PMPM:** $${DEMO_CLAIMS.pmpm}
**YoY trend:** +4.2%

### Top Cost Drivers

${DEMO_CLAIMS.topCostDrivers.map(d => `**${d.category}**: ${d.pct}% of total spend, ${d.trend} YoY trend`).join('\n')}

### Pharmacy
Generic fill rate is **${DEMO_CLAIMS.genericFillRate}%**, above the national benchmark of 82%. Step-therapy compliance is holding. One specialty drug account represents a meaningful share of total Rx spend; worth flagging for stop-loss coordination.

### Emergency Department
**${DEMO_CLAIMS.erVisits} ER visits** in the period. Estimated 38% were classified as avoidable based on primary diagnosis codes. Carrier-sponsored nurse line utilization is low and worth a targeted communication push to redirect non-emergency visits.

### Key Watch-Outs
- ${DEMO_CLAIMS.topCostDrivers[0].category} at ${DEMO_CLAIMS.topCostDrivers[0].pct}% of spend is the largest single driver; review benefit design and comparative effectiveness data from the carrier
- ${DEMO_CLAIMS.topCostDrivers[2].category} trend at ${DEMO_CLAIMS.topCostDrivers[2].trend}; network adequacy warrants review
- Preventive compliance at ${DEMO_CLAIMS.preventiveCompliance}% with direct impact on downstream chronic condition costs`,

    'market-benchmarking': `## Market Benchmarking | ${co} vs. Peer Group

**Peer group:** Employers of similar size and workforce mix, self-funded

| Metric | ${co} | Peer Median | Δ |
|--------|------|-------------|---|
| PMPM (medical) | $${DEMO_CLAIMS.pmpm} | $${DEMO_CLAIMS.peerPmpm} | ${DEMO_CLAIMS.pmpm >= DEMO_CLAIMS.peerPmpm ? 'Above' : 'Below'} |
| Generic fill rate | ${DEMO_CLAIMS.genericFillRate}% | 82% | ${DEMO_CLAIMS.genericFillRate >= 82 ? '+' : ''}${DEMO_CLAIMS.genericFillRate - 82} pts |
| ER visits / 1,000 | ${erPer1000} | 210 | ${erPer1000 >= 210 ? 'Above' : 'Below'} |
| Preventive compliance | ${DEMO_CLAIMS.preventiveCompliance}% | 79% | ${DEMO_CLAIMS.preventiveCompliance >= 79 ? 'Above' : 'Below'} |

**HDHP enrollment penetration:** ${co} is at ~${DEMO_CLAIMS.hdhpUptake}% HDHP uptake vs. a peer median of ${DEMO_CLAIMS.peerHdhpUptake}%. ${DEMO_CLAIMS.hdhpUptake < DEMO_CLAIMS.peerHdhpUptake ? `The gap suggests the employer HSA seed ($${DEMO_PROFILE.hsa.employerSeed.toLocaleString()}) may not be compelling enough relative to the deductible burden. Consider increasing the seed at renewal.` : `Uptake is at or above peer median; the current employer HSA seed ($${DEMO_PROFILE.hsa.employerSeed.toLocaleString()}) is doing its job.`}

**Dental:** Annual maximum of $${DEMO_PROFILE.dental.annualMax.toLocaleString()} ${DEMO_PROFILE.dental.annualMax >= 2000 ? 'is above' : 'is near'} the peer median of $2,000. ${DEMO_PROFILE.dental.annualMax >= 2000 ? 'This is a retention tool worth keeping.' : 'Worth reviewing against retention goals.'}

**Benchmarking takeaway:** ${co}'s Rx management is a strength. The PMPM position is driven primarily by the top cost drivers above. Intervention options are discussed in Strategic Recommendations.`,

    'strategic-recommendations': `## Strategic Recommendations | ${co} Renewal

### Priority 1: ${DEMO_CLAIMS.topCostDrivers[0].category} Cost Management
Commission a network adequacy and utilization review through the carrier before renewal negotiations. ${DEMO_CLAIMS.topCostDrivers[0].category} is the single largest driver at ${DEMO_CLAIMS.topCostDrivers[0].pct}% of spend. Use the findings as leverage on administrative fees, or as the basis for a targeted utilization-management program.

### Priority 2: HSA Seed Strategy
The current employer HSA seed is $${DEMO_PROFILE.hsa.employerSeed.toLocaleString()}. Modeling for similar groups suggests that moving the seed can shift 6–9% of enrollment toward the HDHP, typically producing $150,000–$200,000 in premium relief (or self-funded equivalent) and generating positive ROI in year one.

### Priority 3: ER Diversion Campaign
A targeted "When to go where" communication campaign, delivered via carrier nurse line promotion, can reduce avoidable ER utilization by 15–20% in the first year. This is a $0 benefit-design change that produces measurable ROI.

### Priority 4: Preventive Compliance Push
${co} is at ${DEMO_CLAIMS.preventiveCompliance}% preventive compliance. Every percentage point of improvement reduces expected downstream chronic condition spend. A one-time incentive ($25 gift card for annual physical confirmation) has shown 8–12 pt compliance lift in similar groups.

### Carrier Renewal Positioning
Stop-loss threshold and attachment points should be reviewed given cost-driver concentration. The ${DEMO_PROFILE.loa.stdCarrier} relationship is solid. Recommend requesting a rate hold on the LTD/STD stack in exchange for renewal commitment on medical.`,
  }
}

const WORKER_URL = import.meta.env.VITE_WORKER_URL as string | undefined
const WORKER_TOKEN = import.meta.env.VITE_WORKER_TOKEN as string | undefined

async function generateDraft(DEMO_PROFILE: Client, section: Section, drafts: Record<Section, string>): Promise<string> {
  if (!WORKER_URL || !WORKER_TOKEN) {
    return drafts[section]
  }
  const userMsg = `Generate the "${section}" section of the stewardship report for ${DEMO_PROFILE.companyName}. Claims data: ${JSON.stringify(DEMO_PROFILE.stewardshipClaims)}. Plan data: ${JSON.stringify(DEMO_PROFILE)}. Keep it to 300-400 words.`
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WORKER_TOKEN}` },
    body: JSON.stringify({ botId: 'stewardship', messages: [{ role: 'user', content: userMsg }], maxTokens: 1024 }),
  })
  if (!res.ok) return drafts[section]
  const data = await res.json()
  // Sonnet 5 can lead with a thinking block, so pick the text block by type
  // rather than by position. Position-indexing here fell through to the canned
  // draft silently, which reads as live output.
  return data?.content?.find((b: { type: string }) => b.type === 'text')?.text ?? drafts[section]
}

export default function StewardshipDemo() {
  const DEMO_PROFILE = useClient()
  const DEMO_CLAIMS = DEMO_PROFILE.stewardshipClaims
  const DRAFTS = buildDrafts(DEMO_PROFILE, DEMO_CLAIMS)

  const [selected, setSelected] = useState<Section | null>(null)
  const [draft, setDraft] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async (section: Section) => {
    setSelected(section)
    setDraft(null)
    setLoading(true)
    try {
      const text = await generateDraft(DEMO_PROFILE, section, DRAFTS)
      setDraft(text)
    } catch {
      setDraft(DRAFTS[section])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left: sidebar */}
      <div className="space-y-4">
        {/* client data panel */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
          <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-3">{DEMO_PROFILE.companyName} data</p>
          <div className="space-y-2 text-xs font-body">
            <div className="flex justify-between">
              <span className="text-dark-muted">Total spend</span>
              <span className="text-dark-text font-semibold">${DEMO_CLAIMS.totalSpend.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-muted">PMPM</span>
              <span className="text-dark-text font-semibold">${DEMO_CLAIMS.pmpm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-muted">Generic fill rate</span>
              <span className="text-[#00C47A] font-semibold">{DEMO_CLAIMS.genericFillRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-muted">Preventive compliance</span>
              <span className="text-[#F7D154] font-semibold">{DEMO_CLAIMS.preventiveCompliance}%</span>
            </div>
          </div>
          <div className="border-t border-dark-border mt-3 pt-3">
            <p className="text-[10px] text-dark-muted font-body mb-2 uppercase tracking-widest">Top cost drivers</p>
            {DEMO_CLAIMS.topCostDrivers.map(d => (
              <div key={d.category} className="flex justify-between text-xs font-body py-0.5">
                <span className="text-dark-muted">{d.category}</span>
                <span className="text-dark-text">{d.pct}% <span className="text-dark-muted">{d.trend}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Section picker */}
        <div className="space-y-2">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => generate(s.id)}
              disabled={loading}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-body transition-all ${
                selected === s.id
                  ? 'border-[#5B8FFF]/60 bg-[#5B8FFF]/8 text-dark-text'
                  : 'border-dark-border text-dark-muted hover:border-[#5B8FFF]/30 hover:text-dark-text'
              } disabled:opacity-50`}
            >
              <span className="font-semibold block">{s.label}</span>
              <span className="text-xs opacity-70">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: draft output */}
      <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: '500px' }}>
        {!selected && (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <p className="font-display font-bold text-dark-text text-lg mb-2">Pick a section to generate a draft</p>
              <p className="text-sm font-body text-dark-muted max-w-sm">Each section is grounded in {DEMO_PROFILE.companyName}'s actual plan data and fictional claims data pre-loaded for the demo.</p>
            </div>
          </div>
        )}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#5B8FFF]/60 animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 rounded-full bg-[#5B8FFF]/60 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 rounded-full bg-[#5B8FFF]/60 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
              <p className="text-xs font-body text-dark-muted">Generating draft…</p>
            </div>
          </div>
        )}
        {draft && !loading && (
          <div className="flex-1 overflow-y-auto p-6">
            <pre className="text-sm font-body text-dark-text leading-relaxed whitespace-pre-wrap">{draft}</pre>
          </div>
        )}
        {draft && !loading && selected && (
          <div className="border-t border-dark-border px-6 py-3">
            <ExportBar
              getContent={() => draft}
              filename={`${DEMO_PROFILE.companyName.replace(/\s+/g, '-')}-stewardship-${selected}.md`}
              accent="#5B8FFF"
              note="Markdown — pastes cleanly into Word or Notion"
            />
          </div>
        )}
      </div>
    </div>
  )
}
