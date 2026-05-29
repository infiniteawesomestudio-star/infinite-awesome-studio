import { useState } from 'react'
import { ACME_PROFILE } from '../data/acmeProfile'

type Mode = 'employee' | 'hr'
type Scenario = 'eob' | 'prior-auth' | 'balance-billing'

const COLOR = '#F97316'

const SCENARIOS: { id: Scenario; label: string; short: string }[] = [
  { id: 'eob', label: 'EOB Denial', short: 'EOB' },
  { id: 'prior-auth', label: 'Prior Auth Appeal', short: 'Prior Auth' },
  { id: 'balance-billing', label: 'Balance Billing / No Surprises Act', short: 'NSA' },
]

const EMPLOYEE_CONTENT: Record<Scenario, { title: string; steps: string[]; note: string }> = {
  eob: {
    title: 'Your claim was denied — here\'s what the EOB is actually saying',
    steps: [
      `An EOB (Explanation of Benefits) is not a bill. It's a summary of how ${ACME_PROFILE.claims.medicalCarrier} processed your claim. "Denied" means the carrier didn't pay — not that you owe the provider yet.`,
      `Find the denial reason code on the EOB. Common ones: "not medically necessary," "out-of-network," "service requires prior authorization," or "duplicate claim." The reason code tells you exactly what to challenge.`,
      `Call ${ACME_PROFILE.claims.medicalCarrier} Member Services at ${ACME_PROFILE.claims.memberServicesPhone}. Ask them to explain the denial code in plain language and confirm whether an appeal is appropriate.`,
      `You have ${ACME_PROFILE.claims.appealDeadlineDays} days from the denial date to file an internal appeal. Don't wait — get your provider's clinical notes and a letter of medical necessity if the denial was for "not medically necessary."`,
      `If the internal appeal is denied, you have the right to an external review by an independent organization. ${ACME_PROFILE.claims.externalReviewAvailable ? 'Acme\'s plan participates in external review.' : 'Ask HR about external review options.'}`,
    ],
    note: `Claims Compass helps you understand your EOB and prepares you for the appeal call. It does not file appeals on your behalf or guarantee outcomes.`,
  },
  'prior-auth': {
    title: 'Your procedure needs prior authorization — here\'s how to get it',
    steps: [
      `Prior authorization (PA) means ${ACME_PROFILE.claims.medicalCarrier} must approve a service before it happens. Without it, the claim will be denied even if the service is medically necessary.`,
      `Ask your provider if PA is required before scheduling. ${ACME_PROFILE.claims.priorAuthList}. Your provider's office typically submits the PA request — you don't have to do it yourself.`,
      `If PA was denied, your provider should receive a denial notice with a reason code. Get a copy. Common grounds for PA denial: insufficient clinical documentation, experimental procedure, or alternative treatment not yet tried.`,
      `To appeal a PA denial: have your provider submit additional clinical notes, a letter of medical necessity, and any peer-reviewed literature supporting the treatment. Appeals go to ${ACME_PROFILE.claims.medicalCarrier} — call ${ACME_PROFILE.claims.memberServicesPhone} to start.`,
      `If the service was urgent (needed within 72 hours), you may qualify for an expedited appeal — ${ACME_PROFILE.claims.medicalCarrier} must respond within 72 hours. Request it explicitly when you call.`,
    ],
    note: `Prior auth requirements change annually. Always verify PA requirements before a procedure, even for services that didn't require it in a prior plan year.`,
  },
  'balance-billing': {
    title: 'You received a bill higher than expected — here\'s your No Surprises Act protection',
    steps: [
      `The No Surprises Act (effective 2022) protects you from unexpected bills for emergency services and non-emergency care at in-network facilities from out-of-network providers you didn't choose.`,
      `${ACME_PROFILE.claims.ideoContractStatus} If you were treated at an in-network facility and received a surprise bill from an out-of-network anesthesiologist, radiologist, or assistant surgeon, the NSA likely protects you.`,
      `Your cost-sharing should be limited to what you'd pay for an in-network provider. If you received a higher bill, call ${ACME_PROFILE.claims.medicalCarrier} at ${ACME_PROFILE.claims.memberServicesPhone} and say "I believe this is a balance billing violation under the No Surprises Act."`,
      `Do not pay the disputed amount while the review is pending. Ask the provider to submit the claim through your insurance first. Providers are prohibited from balance billing for NSA-protected services.`,
      `If the dispute isn't resolved, the provider and insurer enter an independent dispute resolution (IDR) process — you are not part of that process and your cost-sharing doesn't change based on the IDR outcome.`,
    ],
    note: `NSA protections do not apply to all situations — they don't cover out-of-network providers you knowingly chose, ground ambulance services, or non-emergency care at out-of-network facilities.`,
  },
}

const HR_CONTENT: Record<Scenario, { title: string; steps: string[]; note: string }> = {
  eob: {
    title: 'Employee comes to HR with an EOB denial — your workflow',
    steps: [
      `HR's role in a claim denial is to help the employee navigate the appeal process, not to adjudicate the claim. Direct them to ${ACME_PROFILE.claims.medicalCarrier} Member Services (${ACME_PROFILE.claims.memberServicesPhone}) as the first step.`,
      `Ask the employee to share the EOB denial reason code. This tells you what documentation will be needed for the appeal — e.g., "not medically necessary" requires a letter of medical necessity from the treating provider.`,
      `Remind the employee of the appeal window: ${ACME_PROFILE.claims.appealDeadlineDays} days from the denial date for an internal appeal. If the employee is close to the deadline, flag it as urgent and help them draft a written appeal promptly.`,
      `If the employee has already been through internal appeal and it was denied, inform them of their right to external review. ${ACME_PROFILE.claims.externalReviewAvailable ? `${ACME_PROFILE.claims.medicalCarrier}'s plan supports external review. The ERISA/ACA external review process is independent and binding.` : 'Contact the carrier for external review options.'}`,
      `Document the interaction. If this is a systemic issue (multiple employees denied for the same service), flag it for the next carrier renewal conversation. Claim denial patterns are a data point for plan design.`,
    ],
    note: `HR should not promise outcomes on claim appeals. Your role is to facilitate access to the process, not to intervene in clinical determinations.`,
  },
  'prior-auth': {
    title: 'Employee says their prior auth was denied — how to help without overstepping',
    steps: [
      `Prior auth decisions are made by ${ACME_PROFILE.claims.medicalCarrier}, not by Acme. HR cannot override or expedite a PA determination — but you can help the employee understand the appeal path.`,
      `Get the PA denial reference number from the employee or their provider. This is required to open an appeal or speak to a clinical reviewer at the carrier.`,
      `For PA appeals, the provider typically drives the process — they have the clinical documentation. Advise the employee to ask their provider to submit a peer-to-peer review request. In a peer-to-peer, the treating physician speaks directly to the carrier's medical director. This is the most effective appeal mechanism for clinical denials.`,
      `If the procedure is urgent (needed within 72 hours), the employee qualifies for an expedited appeal. The carrier must respond within 72 hours. This must be requested explicitly — it's not automatic.`,
      `Track PA denial patterns across employees. If the same procedure is being denied repeatedly, this may indicate a carrier policy change that your broker should address at renewal.`,
    ],
    note: `HIPAA applies. Do not discuss an employee's specific clinical situation with their manager or coworkers. Keep all records in the benefits file, not the personnel file.`,
  },
  'balance-billing': {
    title: 'Employee received a surprise bill — your NSA compliance checklist',
    steps: [
      `First, confirm the facts: Was the care at an in-network facility? Was the out-of-network provider one the employee chose, or one assigned (e.g., on-call anesthesiologist)? NSA applies to the latter, not the former.`,
      `${ACME_PROFILE.claims.nsaCompliant ? `Acme's ${ACME_PROFILE.claims.medicalCarrier} plan is NSA-compliant.` : 'Verify NSA compliance with your broker.'} If the situation is NSA-protected, the employee's cost-sharing should be based on the in-network rate only.`,
      `Direct the employee to call ${ACME_PROFILE.claims.medicalCarrier} at ${ACME_PROFILE.claims.memberServicesPhone} and specifically use the phrase "No Surprises Act balance billing." This routes them to the correct team.`,
      `Advise the employee not to pay the disputed balance while the review is open. Providers cannot collect on balance billing amounts that are NSA-protected. If the provider threatens collections, the employee should notify the carrier immediately.`,
      `If the dispute escalates, it enters an Independent Dispute Resolution (IDR) process between the provider and carrier. HR and the employee are not parties to IDR — the employee's cost-sharing is fixed at the in-network rate regardless of the IDR outcome.`,
    ],
    note: `Ground ambulance services are currently excluded from NSA protections. A separate rulemaking process is ongoing. If an employee receives a surprise ambulance bill, refer them to the carrier for case-by-case review.`,
  },
}

const QUICK_LOOKUPS = [
  { q: 'What\'s the appeal deadline?', a: `${ACME_PROFILE.claims.appealDeadlineDays} days from denial date` },
  { q: 'Carrier member services', a: ACME_PROFILE.claims.memberServicesPhone },
  { q: 'Member portal', a: ACME_PROFILE.claims.memberPortal },
  { q: 'Prior auth list', a: 'Aetna provider portal' },
  { q: 'External review available?', a: ACME_PROFILE.claims.externalReviewAvailable ? 'Yes' : 'No' },
]

export default function ClaimsCompassDemo() {
  const [mode, setMode] = useState<Mode>('employee')
  const [scenario, setScenario] = useState<Scenario>('eob')

  const content = mode === 'employee' ? EMPLOYEE_CONTENT[scenario] : HR_CONTENT[scenario]

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex rounded-xl border border-dark-border overflow-hidden">
          {(['employee', 'hr'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2 text-sm font-body transition-colors ${
                mode === m
                  ? 'text-[#F97316] border-r border-dark-border'
                  : 'text-dark-muted hover:text-dark-text'
              }`}
              style={mode === m ? { backgroundColor: `${COLOR}15` } : {}}
            >
              {m === 'employee' ? 'Employee mode' : 'HR Admin mode'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => setScenario(s.id)}
              className={`px-3 py-1.5 text-xs font-body rounded-lg border transition-all ${
                scenario === s.id
                  ? 'border-[#F97316]/60 bg-[#F97316]/10 text-[#F97316]'
                  : 'border-dark-border text-dark-muted hover:border-[#F97316]/30'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scenario header */}
          <div
            className="rounded-2xl p-5 border"
            style={{ backgroundColor: `${COLOR}0d`, borderColor: `${COLOR}33` }}
          >
            <p
              className="text-xs font-body font-semibold uppercase tracking-widest mb-2"
              style={{ color: COLOR }}
            >
              {SCENARIOS.find(s => s.id === scenario)?.label} — {mode === 'employee' ? 'Employee guidance' : 'HR admin workflow'}
            </p>
            <p className="text-sm font-body text-dark-text font-semibold leading-snug">{content.title}</p>
          </div>

          {/* Steps */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-4">
              {mode === 'employee' ? 'What to do' : 'Admin checklist'}
            </p>
            <ol className="space-y-4">
              {content.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5"
                    style={{ backgroundColor: `${COLOR}20`, color: COLOR }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm font-body text-dark-muted leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Guardrail */}
          <div className="bg-dark-base border border-dark-border rounded-xl px-4 py-3">
            <p className="text-xs font-body text-dark-muted leading-relaxed">
              <span className="font-semibold" style={{ color: COLOR }}>Claims Compass does not: </span>
              {content.note}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick lookups */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-3">Acme claims quick ref</p>
            <div className="space-y-2.5">
              {QUICK_LOOKUPS.map((item, i) => (
                <div key={i} className="flex justify-between gap-2 text-xs font-body">
                  <span className="text-dark-muted">{item.q}</span>
                  <span className="text-dark-text font-semibold text-right">{item.a}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dark-border mt-3 pt-3">
              <p className="text-[10px] text-dark-muted mb-1 uppercase tracking-widest">Benefits carrier</p>
              <p className="text-xs text-dark-text">{ACME_PROFILE.claims.medicalCarrier}</p>
            </div>
          </div>

          {/* Scenario nav */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-3">Other scenarios</p>
            <div className="space-y-2">
              {SCENARIOS.filter(s => s.id !== scenario).map(s => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className="w-full text-left text-xs font-body text-dark-muted hover:text-dark-text transition-colors flex items-center gap-2 group"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors"
                    style={{ backgroundColor: `${COLOR}40` }}
                  />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* HR contact */}
          {mode === 'employee' && (
            <div
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: `${COLOR}0a`, borderColor: `${COLOR}25` }}
            >
              <p className="text-xs font-body font-semibold uppercase tracking-widest mb-2" style={{ color: COLOR }}>
                Need more help?
              </p>
              <p className="text-xs font-body text-dark-muted leading-relaxed">
                Contact Acme HR at{' '}
                <span className="text-dark-text">{ACME_PROFILE.claims.hrClaimsContact}</span>
                {' '}or call {ACME_PROFILE.claims.medicalCarrier} directly at{' '}
                <span className="text-dark-text">{ACME_PROFILE.claims.memberServicesPhone}</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
