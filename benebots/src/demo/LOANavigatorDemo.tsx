import { useState } from 'react'
import { ACME_PROFILE } from '../data/acmeProfile'

type Mode = 'employee' | 'hr'
type State = 'CA' | 'NY' | 'WA' | 'other'

const STATE_LEAVE: Record<Exclude<State, 'other'>, { name: string; paidLeave: string; duration: string; note: string }> = {
  CA: {
    name: 'California',
    paidLeave: 'California Paid Family Leave (PFL), up to 8 weeks at 60–70% of wages',
    duration: 'CFRA: up to 12 weeks job-protected leave',
    note: 'CA requires leave stacking analysis between CFRA, PDL (pregnancy disability), and FMLA. They do not run concurrently in all cases.',
  },
  NY: {
    name: 'New York',
    paidLeave: 'NY Paid Family Leave, up to 12 weeks at 67% of statewide average weekly wage',
    duration: '12 weeks of job-protected, paid leave',
    note: 'NY PFL is employee-funded via payroll deduction. HR must track the NY DBL (disability) integration with PFL when leaves overlap.',
  },
  WA: {
    name: 'Washington',
    paidLeave: 'WA Paid Family & Medical Leave, up to 12 weeks (18 in some cases) at 90% of wages up to state average',
    duration: '12–18 weeks depending on qualifying event',
    note: 'WA PFML has both employee and employer contribution requirements. HR must register and report quarterly.',
  },
}

const EMPLOYEE_CONTENT: Record<State, string[]> = {
  CA: [
    `Acme offers ${ACME_PROFILE.loa.companyParentalLeave} of fully paid parental leave. This runs concurrently with FMLA (up to 12 weeks) and CFRA.`,
    `California adds up to 8 weeks of paid CA PFL through the state program, which begins where Acme's paid leave ends.`,
    `Short-term disability through ${ACME_PROFILE.loa.stdCarrier} covers your income during medical portions of leave (pregnancy recovery, serious health condition).`,
    `Contact ${ACME_PROFILE.loa.loaAdministrator} to start your leave paperwork. Acme requires the fitness-for-duty form before returning to work.`,
  ],
  NY: [
    `Acme's ${ACME_PROFILE.loa.companyParentalLeave} of paid parental leave stacks with NY PFL (up to 12 weeks at 67% of the statewide average weekly wage).`,
    `FMLA runs concurrently with NY PFL for qualifying events. You typically only get the longer of the two, not both added together.`,
    `STD through ${ACME_PROFILE.loa.stdCarrier} covers disability-related absence (pregnancy disability, serious health condition). PFL covers bonding or family care.`,
    `Start with ${ACME_PROFILE.loa.loaAdministrator}. NY requires 30 days notice when leave is foreseeable.`,
  ],
  WA: [
    `WA Paid Family & Medical Leave provides up to 12 weeks (18 in some cases) at approximately 90% of your wage up to the state average.`,
    `Acme's ${ACME_PROFILE.loa.companyParentalLeave} of paid parental leave runs concurrently with FMLA and WA PFML.`,
    `Notify ${ACME_PROFILE.loa.loaAdministrator} as early as possible, ideally 30 days before leave. WA PFML applications go through the WA Employment Security Department directly.`,
    `Fitness-for-duty form required before returning from medical leave.`,
  ],
  other: [
    `Federal FMLA provides up to 12 weeks of job-protected, unpaid leave for qualifying events (serious health condition, new child, qualifying military exigency).`,
    `Acme's ${ACME_PROFILE.loa.companyParentalLeave} of fully paid parental leave applies for new child events. This is Acme's policy on top of FMLA.`,
    `STD/LTD coverage through ${ACME_PROFILE.loa.stdCarrier} provides income replacement during disability-related absences.`,
    `Contact ${ACME_PROFILE.loa.loaAdministrator} to initiate. Allow 5–7 business days for paperwork processing.`,
  ],
}

const HR_CONTENT: Record<State, string[]> = {
  CA: [
    `Designate FMLA and CFRA concurrently where they overlap, but note that Pregnancy Disability Leave (PDL) runs separately from CFRA baby bonding. Total protected leave for a birthing employee can exceed 12 weeks in CA.`,
    `CA PFL is state-administered. HR does not manage the claims, but must coordinate the leave dates with payroll and the employee.`,
    `Ensure CFRA and FMLA notices go out within 5 business days of learning of the need for leave. Document the designation in writing.`,
    `Fitness-for-duty certification is required before reinstatement from medical leave. Do not require it for baby bonding leave. That's a CA CFRA pitfall.`,
    `Benefits continuation: maintain health coverage during CFRA/FMLA at the same cost as if the employee were actively working.`,
  ],
  NY: [
    `NY PFL and FMLA run concurrently when both apply. Notify the employee of both designations simultaneously.`,
    `NY PFL claims are submitted by the employee directly to the carrier (the DBL carrier handles NY PFL for most groups). HR's role is to provide the leave dates and return-to-work information.`,
    `For pregnancy: NY DBL covers the disability period (typically 6–8 weeks for vaginal delivery, 8–10 for C-section). NY PFL baby bonding begins after DBL ends.`,
    `30-day advance notice requirement for foreseeable leave. Document if the employee gave less notice and why.`,
    `Acme's ${ACME_PROFILE.loa.companyParentalLeave} of paid parental leave runs concurrently. Coordinate payroll integration carefully since NY PFL is a separate wage benefit.`,
  ],
  WA: [
    `WA PFML is administered by the WA Employment Security Department. Employees apply directly; HR must verify employment and confirm leave dates when contacted.`,
    `Acme must continue benefits during WA PFML leave and maintain the employee's position (or equivalent) upon return.`,
    `Track employer contribution requirements. WA PFML has both employee and employer premium shares. Confirm your payroll is remitting correctly.`,
    `FMLA runs concurrently with WA PFML. Provide both designations in writing.`,
    `Return-to-work: Acme's fitness-for-duty process applies for medical leaves. Do not apply it to bonding leaves.`,
  ],
  other: [
    `FMLA applies to employers with 50+ employees. Acme meets this threshold. Designate eligible leave within 5 business days.`,
    `Provide the employee with the FMLA rights notice (WHD Publication 1420) and the designation notice.`,
    `STD/LTD through ${ACME_PROFILE.loa.stdCarrier} manages income replacement. Coordinate leave dates with the carrier's claim status.`,
    `Benefits continue during FMLA at the same cost. If the employee fails to return, you may recover the employer's share of premiums paid.`,
    `Acme's ${ACME_PROFILE.loa.companyParentalLeave} paid parental leave policy runs concurrently with FMLA for qualifying events. Document both.`,
  ],
}

const ASK_HR_CHECKLIST = [
  "How do I start my leave paperwork?",
  "Will my benefits continue during leave?",
  "How does my salary get covered? Is it STD, state leave, or Acme's policy?",
  "Can I take leave in increments, or does it have to be continuous?",
  "What do I need to provide before I can return?",
]

export default function LOANavigatorDemo() {
  const [mode, setMode] = useState<Mode>('employee')
  const [state, setState] = useState<State>('CA')

  const content = mode === 'employee' ? EMPLOYEE_CONTENT[state] : HR_CONTENT[state]
  const stateInfo = state !== 'other' ? STATE_LEAVE[state] : null

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
                mode === m ? 'bg-[#A78BFA]/15 text-[#A78BFA] border-r border-dark-border' : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              {m === 'employee' ? 'Employee mode' : 'HR Admin mode'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(['CA', 'NY', 'WA', 'other'] as State[]).map(s => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={`px-3 py-1.5 text-xs font-body rounded-lg border transition-all ${
                state === s
                  ? 'border-[#A78BFA]/60 bg-[#A78BFA]/10 text-[#A78BFA]'
                  : 'border-dark-border text-dark-muted hover:border-[#A78BFA]/30'
              }`}
            >
              {s === 'other' ? 'Other state' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* State leave overview */}
          {stateInfo && (
            <div className="bg-dark-card border border-[#A78BFA]/20 rounded-2xl p-5">
              <p className="text-xs font-body font-semibold uppercase tracking-widest text-[#A78BFA] mb-3">{stateInfo.name} leave overview</p>
              <div className="space-y-2 text-sm font-body">
                <p className="text-dark-text"><span className="text-dark-muted">Paid leave: </span>{stateInfo.paidLeave}</p>
                <p className="text-dark-text"><span className="text-dark-muted">Duration: </span>{stateInfo.duration}</p>
              </div>
              <p className="text-xs font-body text-dark-muted mt-3 leading-relaxed border-t border-dark-border pt-3">{stateInfo.note}</p>
            </div>
          )}

          {/* Mode-specific guidance */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-4">
              {mode === 'employee' ? 'What this means for you' : 'HR admin checklist'}
            </p>
            <ul className="space-y-3">
              {content.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] flex-shrink-0 mt-2" />
                  <p className="text-sm font-body text-dark-muted leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Guardrail */}
          <div className="bg-dark-base border border-dark-border rounded-xl px-4 py-3">
            <p className="text-xs font-body text-dark-muted leading-relaxed">
              <span className="text-[#A78BFA] font-semibold">LOA Navigator does not: </span>
              calculate specific dates or duration, determine FMLA eligibility for specific employees, or provide legal advice. Use this for education. Eligibility determinations belong with HR and legal counsel.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-3">Acme leave summary</p>
            <div className="space-y-2 text-xs font-body">
              <div className="flex justify-between gap-2">
                <span className="text-dark-muted">Parental leave</span>
                <span className="text-dark-text font-semibold text-right">{ACME_PROFILE.loa.companyParentalLeave}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-dark-muted">STD carrier</span>
                <span className="text-dark-text">{ACME_PROFILE.loa.stdCarrier}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-dark-muted">LTD carrier</span>
                <span className="text-dark-text">{ACME_PROFILE.loa.ltdCarrier}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-dark-muted">State coverage</span>
                <span className="text-dark-text">{ACME_PROFILE.loa.stateLeaveJurisdictions.join(', ')}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-dark-muted">Return to work</span>
                <span className="text-dark-text text-right">{ACME_PROFILE.loa.returnToWorkProcess}</span>
              </div>
            </div>
            <div className="border-t border-dark-border mt-3 pt-3">
              <p className="text-[10px] text-dark-muted mb-1 uppercase tracking-widest">LOA contact</p>
              <p className="text-xs text-dark-text">{ACME_PROFILE.loa.loaAdministrator}</p>
            </div>
          </div>

          {mode === 'employee' && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
              <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-3">What to ask HR</p>
              <ul className="space-y-2">
                {ASK_HR_CHECKLIST.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-body text-dark-muted">
                    <span className="w-4 h-4 rounded bg-[#A78BFA]/10 border border-[#A78BFA]/30 flex items-center justify-center flex-shrink-0 text-[#A78BFA] font-bold text-[10px]">{i + 1}</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
