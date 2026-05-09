import { useState } from 'react'
import { ACME_PROFILE } from '../data/acmeProfile'

type Section =
  | 'executive-summary'
  | 'claims-analysis'
  | 'market-benchmarking'
  | 'strategic-recommendations'

const SECTIONS: { id: Section; label: string; desc: string }[] = [
  { id: 'executive-summary', label: 'Executive Summary', desc: 'High-level narrative for leadership' },
  { id: 'claims-analysis', label: 'Claims & Utilization', desc: 'Cost drivers and trend analysis' },
  { id: 'market-benchmarking', label: 'Market Benchmarking', desc: 'How Acme compares to peers' },
  { id: 'strategic-recommendations', label: 'Strategic Recommendations', desc: 'Action items for renewal' },
]

// Fictional Acme claims data for demo realism
const ACME_CLAIMS = {
  totalSpend: 3_420_000,
  memberMonths: 5_200,
  pmpm: 658,
  topCostDrivers: [
    { category: 'Musculoskeletal', pct: 18, trend: '+6%' },
    { category: 'Cardiovascular', pct: 14, trend: '+3%' },
    { category: 'Mental Health', pct: 12, trend: '+11%' },
    { category: 'Oncology', pct: 9, trend: '+2%' },
  ],
  genericFillRate: 87,
  erVisits: 142,
  preventiveCompliance: 72,
}

const DRAFTS: Record<Section, string> = {
  'executive-summary': `## Executive Summary | Acme Industries Plan Year ${ACME_PROFILE.planYear}

**Prepared for:** ${ACME_PROFILE.companyName} (${ACME_PROFILE.companySize})

Total plan spend for the period was **$${ACME_CLAIMS.totalSpend.toLocaleString()}**, or **$${ACME_CLAIMS.pmpm}/member/month**, tracking 4.2% above prior year. The group is self-funded, with stop-loss protection through The Hartford.

**Three things leadership needs to know:**

1. **Mental health spend is up 11%.** At 12% of total claims, this is Acme's fastest-growing cost driver. It reflects national trends but is accelerating faster than the peer benchmark. A carrier-sponsored EAP audit and network adequacy review are recommended before renewal.

2. **Generic fill rate is strong at ${ACME_CLAIMS.genericFillRate}%.** Rx management is working. The step-therapy program introduced last renewal cycle is producing measurable savings, estimated at $180,000 in avoidance vs. brand-only utilization.

3. **Preventive compliance sits at ${ACME_CLAIMS.preventiveCompliance}%.** Leaving $0-deductible, $0-copay value on the table. A targeted communication campaign during the next OE cycle is the lowest-cost intervention with highest potential ROI.

The renewal strategy section covers carrier negotiation positioning, plan design adjustment options, and a three-year trend projection at current trajectory.`,

  'claims-analysis': `## Claims & Utilization Analysis | Acme Industries ${ACME_PROFILE.planYear}

**Total medical + Rx spend:** $${ACME_CLAIMS.totalSpend.toLocaleString()}
**Member months:** ${ACME_CLAIMS.memberMonths.toLocaleString()}
**PMPM:** $${ACME_CLAIMS.pmpm}
**YoY trend:** +4.2%

### Top Cost Drivers

${ACME_CLAIMS.topCostDrivers.map(d => `**${d.category}**: ${d.pct}% of total spend, ${d.trend} YoY trend`).join('\n')}

### Pharmacy
Generic fill rate is **${ACME_CLAIMS.genericFillRate}%**, above the national benchmark of 82%. Step-therapy compliance is holding. One specialty drug account (oncology) represents 31% of total Rx spend; worth flagging for stop-loss coordination.

### Emergency Department
**${ACME_CLAIMS.erVisits} ER visits** in the period. Estimated 38% were classified as avoidable based on primary diagnosis codes. Carrier-sponsored nurse line utilization is low and worth a targeted communication push to redirect non-emergency visits.

### Key Watch-Outs
- Mental health trend at +11%. Network adequacy and EAP utilization both warrant review
- Musculoskeletal at 18% of spend. Physical therapy benefit design may be driving utilization; consider comparative effectiveness data from carrier
- Preventive compliance at ${ACME_CLAIMS.preventiveCompliance}% with direct impact on downstream chronic condition costs`,

  'market-benchmarking': `## Market Benchmarking | Acme Industries vs. Peer Group

**Peer group:** Mid-size employers, 400–600 employees, mixed-state workforce, self-funded

| Metric | Acme | Peer Median | Δ |
|--------|------|-------------|---|
| PMPM (medical) | $${ACME_CLAIMS.pmpm} | $631 | +4.3% |
| Generic fill rate | ${ACME_CLAIMS.genericFillRate}% | 82% | +5 pts ✓ |
| ER visits / 1,000 | ${Math.round(ACME_CLAIMS.erVisits / (ACME_CLAIMS.memberMonths / 12) * 1000)} | 210 | Above |
| Mental health trend | +11% | +8% | Above |
| Preventive compliance | ${ACME_CLAIMS.preventiveCompliance}% | 79% | Below |

**HDHP enrollment penetration:** Acme is at ~40% HDHP uptake vs. a peer median of 52%. The gap suggests the employer HSA seed ($${ACME_PROFILE.hsa.employerSeed.toLocaleString()}) may not be compelling enough relative to the deductible burden. Consider increasing the seed at renewal. Even a $200 increase often moves enrollment materially.

**Dental:** Annual maximum of $${ACME_PROFILE.dental.annualMax.toLocaleString()} is above peer median of $2,000. This is a retention tool worth keeping. Orthodontia at $2,000 lifetime is at market.

**Benchmarking takeaway:** Acme's Rx management is a strength. The PMPM gap is driven primarily by mental health trend, which is consistent with white-collar workforce profiles nationally. Intervention options are discussed in Strategic Recommendations.`,

  'strategic-recommendations': `## Strategic Recommendations | Acme Industries Renewal

### Priority 1: Mental Health Network Audit
Commission a network adequacy review through the carrier before renewal negotiations. Specifically: in-network therapist availability within 30 miles of each major employee zip cluster. If adequacy is below 80%, use it as negotiating leverage on administrative fees. If adequacy is adequate, the spend increase is a utilization story. Consider an EAP awareness campaign.

### Priority 2: HSA Seed Increase
Increasing the employer HSA seed from $${ACME_PROFILE.hsa.employerSeed.toLocaleString()} to $1,200 would cost approximately $90,000 in additional employer spend, but actuarial modeling for similar groups suggests 6–9% migration toward the HDHP. That migration typically produces $150,000–$200,000 in premium relief (or self-funded equivalent), generating positive ROI in year one.

### Priority 3: ER Diversion Campaign
A targeted "When to go where" communication campaign, delivered via carrier nurse line promotion, can reduce avoidable ER utilization by 15–20% in the first year. This is a $0 benefit-design change that produces measurable ROI.

### Priority 4: Preventive Compliance Push
${ACME_PROFILE.companyName} is leaving 7 percentage points of preventive compliance on the table vs. peer median. Every percentage point of improvement reduces expected downstream chronic condition spend. A one-time incentive ($25 gift card for annual physical confirmation) has shown 8–12 pt compliance lift in similar groups.

### Carrier Renewal Positioning
Current stop-loss threshold and attachment points should be reviewed given oncology spend concentration. The Hartford relationship is solid. Recommend requesting a rate hold on the LTD/STD stack in exchange for renewal commitment on medical.`,
}

const WORKER_URL = import.meta.env.VITE_WORKER_URL as string | undefined
const WORKER_TOKEN = import.meta.env.VITE_WORKER_TOKEN as string | undefined

async function generateDraft(section: Section): Promise<string> {
  if (!WORKER_URL || !WORKER_TOKEN) {
    // Return canned demo draft
    return DRAFTS[section]
  }
  const systemPrompt = `You are Stewardship Studio, a benefits consulting AI for ${ACME_PROFILE.companyName}. Generate a professional stewardship report section in Markdown. Use the plan data and claims data provided. Be specific, cite numbers, write like a senior benefits consultant.`
  const userMsg = `Generate the "${section}" section of the stewardship report for Acme Industries. Claims data: ${JSON.stringify(ACME_CLAIMS)}. Plan data: ${JSON.stringify(ACME_PROFILE)}. Keep it to 300-400 words.`
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WORKER_TOKEN}` },
    body: JSON.stringify({ system: systemPrompt, messages: [{ role: 'user', content: userMsg }], maxTokens: 1024 }),
  })
  if (!res.ok) return DRAFTS[section]
  const data = await res.json()
  return data?.content?.[0]?.text ?? DRAFTS[section]
}

export default function StewardshipDemo() {
  const [selected, setSelected] = useState<Section | null>(null)
  const [draft, setDraft] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async (section: Section) => {
    setSelected(section)
    setDraft(null)
    setLoading(true)
    const text = await generateDraft(section)
    setDraft(text)
    setLoading(false)
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left: sidebar */}
      <div className="space-y-4">
        {/* Acme data panel */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
          <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-3">Acme Industries data</p>
          <div className="space-y-2 text-xs font-body">
            <div className="flex justify-between">
              <span className="text-dark-muted">Total spend</span>
              <span className="text-dark-text font-semibold">${ACME_CLAIMS.totalSpend.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-muted">PMPM</span>
              <span className="text-dark-text font-semibold">${ACME_CLAIMS.pmpm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-muted">Generic fill rate</span>
              <span className="text-[#00C47A] font-semibold">{ACME_CLAIMS.genericFillRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-muted">Preventive compliance</span>
              <span className="text-[#F7D154] font-semibold">{ACME_CLAIMS.preventiveCompliance}%</span>
            </div>
          </div>
          <div className="border-t border-dark-border mt-3 pt-3">
            <p className="text-[10px] text-dark-muted font-body mb-2 uppercase tracking-widest">Top cost drivers</p>
            {ACME_CLAIMS.topCostDrivers.map(d => (
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
              <p className="text-sm font-body text-dark-muted max-w-sm">Each section is grounded in Acme's actual plan data and fictional claims data pre-loaded for the demo.</p>
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
        {draft && !loading && (
          <div className="border-t border-dark-border px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] font-body text-dark-muted">Markdown format. Copies cleanly into Word or Notion</p>
            <button
              onClick={() => navigator.clipboard.writeText(draft)}
              className="text-xs font-body text-dark-muted hover:text-[#5B8FFF] transition-colors"
            >
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
