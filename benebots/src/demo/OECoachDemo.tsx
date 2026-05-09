import { useState } from 'react'
import { ACME_PROFILE } from '../data/acmeProfile'

type Step = 'q1' | 'q2' | 'q3' | 'q4' | 'result'
type CareLevel = 'low' | 'moderate' | 'high'
type FamilyStatus = 'single' | 'family'
type HsaFamiliarity = 'yes' | 'no'
type BudgetPreference = 'lower-now' | 'lower-risk'

interface Answers {
  care: CareLevel
  family: FamilyStatus
  hsa: HsaFamiliarity
  budget: BudgetPreference
}

function getRecommendation(a: Answers) {
  const isHDHP =
    a.care === 'low' ||
    (a.care === 'moderate' && a.hsa === 'yes' && a.budget === 'lower-now')

  const plan = isHDHP ? ACME_PROFILE.medical.hdhp : ACME_PROFILE.medical.ppo
  const hsaNote = isHDHP
    ? `Open an HSA. Acme seeds $${ACME_PROFILE.hsa.employerSeed.toLocaleString()}. That's free money in your account on day one. You can contribute up to $${
        a.family === 'family'
          ? ACME_PROFILE.hsa.limit2026Family.toLocaleString()
          : ACME_PROFILE.hsa.limit2026Individual.toLocaleString()
      } total for ${ACME_PROFILE.planYear}.`
    : `You can't pair an HSA with the PPO, but a Dependent Care FSA (up to $${ACME_PROFILE.fsa.dependentCareFsa.limit.toLocaleString()}) and a Health FSA (up to $${ACME_PROFILE.fsa.healthFsa.limit.toLocaleString()}) are still available.`

  const tradeoff = isHDHP
    ? `You're betting that your actual care costs stay below the deductible. The HSA seed and tax savings make that bet favorable for most ${a.care === 'low' ? 'low utilizers' : 'moderate utilizers who plan ahead'}.`
    : `You're paying more in premiums to avoid the deductible uncertainty. That's the right call when care is predictable and you don't want to manage an HSA.`

  const dontForget = [
    isHDHP ? `Enroll in the HSA. It doesn't open automatically` : `Check if a Limited Purpose FSA is available alongside the PPO`,
    a.family === 'family' ? `Review the family deductible: $${plan.deductible.family.toLocaleString()} for ${plan.name}` : `Your individual OOPM is $${plan.oopm.individual.toLocaleString()}`,
    `Dental: ${ACME_PROFILE.dental.carrier}. Preventive is 100%, no deductible`,
  ]

  return { plan, hsaNote, tradeoff, dontForget, isHDHP }
}

export default function OECoachDemo() {
  const [step, setStep] = useState<Step>('q1')
  const [answers, setAnswers] = useState<Partial<Answers>>({})

  const set = (key: keyof Answers, val: string) => {
    setAnswers(prev => ({ ...prev, [key]: val as never }))
  }

  const next = (key: keyof Answers, val: string) => {
    set(key, val)
    const steps: Step[] = ['q1', 'q2', 'q3', 'q4', 'result']
    const idx = steps.indexOf(step)
    setStep(steps[idx + 1])
  }

  const reset = () => {
    setStep('q1')
    setAnswers({})
  }

  const rec = step === 'result' && answers.care && answers.family && answers.hsa && answers.budget
    ? getRecommendation(answers as Answers)
    : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      {step !== 'result' && (
        <div className="flex gap-2">
          {(['q1', 'q2', 'q3', 'q4'] as Step[]).map(s => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-all"
              style={{ backgroundColor: s <= step ? '#FF6F61' : '#1e2630' }}
            />
          ))}
        </div>
      )}

      <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
        {step === 'q1' && (
          <Question
            label="1 of 4: Expected care level"
            prompt="How much medical care do you expect to use this year?"
            options={[
              { val: 'low', label: 'Low', desc: 'Annual physical, maybe one urgent care. No ongoing Rx.' },
              { val: 'moderate', label: 'Moderate', desc: 'A few specialist visits, regular prescriptions.' },
              { val: 'high', label: 'High', desc: 'Ongoing specialist care, surgery, frequent Rx.' },
            ]}
            onSelect={v => next('care', v)}
          />
        )}
        {step === 'q2' && (
          <Question
            label="2 of 4: Coverage tier"
            prompt="Who are you covering?"
            options={[
              { val: 'single', label: 'Just me', desc: 'Employee-only coverage.' },
              { val: 'family', label: 'Family', desc: 'Spouse, dependents, or both.' },
            ]}
            onSelect={v => next('family', v)}
          />
        )}
        {step === 'q3' && (
          <Question
            label="3 of 4: HSA familiarity"
            prompt="Are you comfortable managing an HSA?"
            options={[
              { val: 'yes', label: 'Yes', desc: "I know how HSAs work or I'm willing to learn." },
              { val: 'no', label: 'Not really', desc: "I'd rather have predictable copays." },
            ]}
            onSelect={v => next('hsa', v)}
          />
        )}
        {step === 'q4' && (
          <Question
            label="4 of 4: Budget preference"
            prompt="What matters more to you right now?"
            options={[
              { val: 'lower-now', label: 'Lower paycheck deduction', desc: 'I want more in my pocket each pay period.' },
              { val: 'lower-risk', label: 'Predictable costs', desc: "I don't want surprises when I use the plan." },
            ]}
            onSelect={v => next('budget', v)}
          />
        )}
        {step === 'result' && rec && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-body text-dark-muted uppercase tracking-widest mb-2">Recommendation</p>
              <p className="font-display font-bold text-2xl text-dark-text">{rec.plan.name}</p>
              <p className="text-sm font-body text-dark-muted mt-1">{rec.isHDHP ? 'HDHP + HSA pair' : 'Traditional PPO'}</p>
            </div>

            <div className="border-t border-dark-border pt-4 space-y-3">
              <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted">HSA / FSA strategy</p>
              <p className="text-sm font-body text-dark-muted leading-relaxed">{rec.hsaNote}</p>
            </div>

            <div className="border-t border-dark-border pt-4 space-y-3">
              <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted">Don't forget</p>
              <ul className="space-y-2">
                {rec.dontForget.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-body text-dark-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6F61] flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-dark-border pt-4">
              <p className="text-xs font-body font-semibold uppercase tracking-widest text-dark-muted mb-2">The trade-off you're making</p>
              <p className="text-sm font-body text-dark-muted leading-relaxed italic">{rec.tradeoff}</p>
            </div>

            <button
              onClick={reset}
              className="text-sm font-body text-dark-muted hover:text-[#FF6F61] transition-colors"
            >
              ← Start over
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] font-body text-dark-muted text-center">
        Demo mode. Recommendations based on Acme Industries plan data. Not a substitute for a licensed benefits advisor.
      </p>
    </div>
  )
}

function Question({
  label,
  prompt,
  options,
  onSelect,
}: {
  label: string
  prompt: string
  options: { val: string; label: string; desc: string }[]
  onSelect: (val: string) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-body uppercase tracking-widest text-[#FF6F61] mb-1">{label}</p>
        <p className="font-display font-bold text-dark-text text-lg">{prompt}</p>
      </div>
      <div className="space-y-2.5">
        {options.map(o => (
          <button
            key={o.val}
            onClick={() => onSelect(o.val)}
            className="w-full text-left px-4 py-3.5 border border-dark-border rounded-xl hover:border-[#FF6F61]/40 hover:bg-[#FF6F61]/5 transition-all group"
          >
            <span className="font-display font-semibold text-dark-text block">{o.label}</span>
            <span className="text-xs font-body text-dark-muted">{o.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
