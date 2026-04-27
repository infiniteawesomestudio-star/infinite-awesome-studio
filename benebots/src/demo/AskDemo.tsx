import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { ACME_PROFILE } from '../data/acmeProfile'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED = [
  "What's the difference between the HDHP and PPO?",
  "How much does Acme put in my HSA?",
  "I just had a baby — what do I do?",
  "When is open enrollment?",
]

const SYSTEM_PROMPT = `You are Ask BeneBot, an AI benefits assistant for ${ACME_PROFILE.companyName} employees during plan year ${ACME_PROFILE.planYear}. You know this company's benefits inside out. Answer every question using the actual plan data below. Cite the specific plan when relevant. If the answer isn't in the plan data, say so clearly — never guess.

Company: ${ACME_PROFILE.companyName} (${ACME_PROFILE.companySize})

MEDICAL PLANS:
1. ${ACME_PROFILE.medical.hdhp.name}
   - Individual deductible: $${ACME_PROFILE.medical.hdhp.deductible.individual.toLocaleString()}
   - Family deductible: $${ACME_PROFILE.medical.hdhp.deductible.family.toLocaleString()}
   - Individual OOPM: $${ACME_PROFILE.medical.hdhp.oopm.individual.toLocaleString()}
   - Family OOPM: $${ACME_PROFILE.medical.hdhp.oopm.family.toLocaleString()}
   - Coinsurance: ${ACME_PROFILE.medical.hdhp.coinsurance}
   - Employer HSA seed: $${ACME_PROFILE.medical.hdhp.employerHsaSeed.toLocaleString()}/year

2. ${ACME_PROFILE.medical.ppo.name}
   - Individual deductible: $${ACME_PROFILE.medical.ppo.deductible.individual.toLocaleString()}
   - Family deductible: $${ACME_PROFILE.medical.ppo.deductible.family.toLocaleString()}
   - Individual OOPM: $${ACME_PROFILE.medical.ppo.oopm.individual.toLocaleString()}
   - Family OOPM: $${ACME_PROFILE.medical.ppo.oopm.family.toLocaleString()}
   - Primary care copay: $${ACME_PROFILE.medical.ppo.primaryCareCopay}
   - Specialist copay: $${ACME_PROFILE.medical.ppo.specialistCopay}
   - Coinsurance: ${ACME_PROFILE.medical.ppo.coinsurance}

DENTAL: ${ACME_PROFILE.dental.carrier}
   - Preventive: ${ACME_PROFILE.dental.preventive} (no deductible)
   - Basic: ${ACME_PROFILE.dental.basic}
   - Major: ${ACME_PROFILE.dental.major}
   - Ortho: ${ACME_PROFILE.dental.ortho}
   - Annual max: $${ACME_PROFILE.dental.annualMax.toLocaleString()}

VISION: ${ACME_PROFILE.vision.carrier}

HSA (for HDHP enrollees):
   - ${ACME_PROFILE.planYear} individual limit: $${ACME_PROFILE.hsa.limit2026Individual.toLocaleString()}
   - ${ACME_PROFILE.planYear} family limit: $${ACME_PROFILE.hsa.limit2026Family.toLocaleString()}
   - Catch-up (55+): additional $${ACME_PROFILE.hsa.catchUp55.toLocaleString()}
   - Employer seed: $${ACME_PROFILE.hsa.employerSeed.toLocaleString()}

FSA:
   - Health FSA limit: $${ACME_PROFILE.fsa.healthFsa.limit.toLocaleString()} (carryover: $${ACME_PROFILE.fsa.healthFsa.carryover})
   - Limited-purpose FSA: available for HDHP/HSA enrollees
   - Dependent care FSA: $${ACME_PROFILE.fsa.dependentCareFsa.limit.toLocaleString()}

401(k): ${ACME_PROFILE.retirement.match}. Roth option: yes. SECURE 2.0 catch-up: yes.

LEAVE:
   - FMLA: covered
   - Parental leave: ${ACME_PROFILE.loa.companyParentalLeave}
   - STD/LTD carrier: ${ACME_PROFILE.loa.stdCarrier}
   - State leave coverage: ${ACME_PROFILE.loa.stateLeaveJurisdictions.join(', ')}
   - LOA contact: ${ACME_PROFILE.loa.loaAdministrator}

COBRA: Administered by ${ACME_PROFILE.cobra.administrator}. Election window: ${ACME_PROFILE.cobra.qualifyingEventWindow} days from qualifying event.

Keep answers direct and plain. Use real benefit terms — employees trust specifics. Short paragraphs. If a question needs a follow-up clarification, ask one question. This is a demo — you are showing what a real deployed Ask BeneBot looks like for an actual client.`

const WORKER_URL = import.meta.env.VITE_WORKER_URL as string | undefined
const WORKER_TOKEN = import.meta.env.VITE_WORKER_TOKEN as string | undefined

async function callWorker(messages: Message[], system: string): Promise<string> {
  if (!WORKER_URL || !WORKER_TOKEN) {
    throw new Error('WORKER_NOT_CONFIGURED')
  }
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WORKER_TOKEN}`,
    },
    body: JSON.stringify({ system, messages, maxTokens: 1024 }),
  })
  if (!res.ok) throw new Error(`Worker error ${res.status}`)
  const data = await res.json()
  return data?.content?.[0]?.text ?? ''
}

export default function AskDemo() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    setError(null)
    try {
      const reply = await callWorker(next, SYSTEM_PROMPT)
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown'
      if (msg === 'WORKER_NOT_CONFIGURED') {
        setError('Demo worker not configured. Set VITE_WORKER_URL and VITE_WORKER_TOKEN to enable live responses.')
      } else {
        setError(`Worker error: ${msg}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(input)
  }

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      {/* Chat window */}
      <div className="flex-1 min-h-0 bg-dark-card border border-dark-border rounded-2xl flex flex-col overflow-hidden">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-10">
              <div className="text-center">
                <p className="font-display font-bold text-dark-text text-lg mb-1">Ask BeneBot — Acme Industries</p>
                <p className="text-sm font-body text-dark-muted max-w-sm">
                  Ask anything about Acme's benefits. Every answer is grounded in the actual plan data.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                {SUGGESTED.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-left px-4 py-3 text-sm font-body text-dark-muted bg-dark-base border border-dark-border rounded-xl hover:border-[#00C47A]/40 hover:text-[#00C47A] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-[#00C47A]/10 border border-[#00C47A]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex gap-0.5">
                      <div className="w-1 h-1 rounded-full bg-[#00C47A]" />
                      <div className="w-1 h-1 rounded-full bg-[#00C47A]" />
                    </div>
                    <div className="w-2 h-0.5 rounded-full bg-[#00C47A]/60" />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[#00C47A] text-deep-forest rounded-tr-sm'
                    : 'bg-dark-base border border-dark-border text-dark-text rounded-tl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-[#00C47A]/10 border border-[#00C47A]/30 flex items-center justify-center flex-shrink-0">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-[#00C47A]" />
                    <div className="w-1 h-1 rounded-full bg-[#00C47A]" />
                  </div>
                  <div className="w-2 h-0.5 rounded-full bg-[#00C47A]/60" />
                </div>
              </div>
              <div className="bg-dark-base border border-dark-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C47A]/60 animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C47A]/60 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C47A]/60 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-xs font-body text-dark-muted bg-dark-base border border-dark-border rounded-xl px-4 py-2 inline-block">{error}</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-dark-border p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about Acme's benefits…"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-body bg-dark-base border border-dark-border rounded-xl text-dark-text placeholder-dark-muted focus:outline-none focus:border-[#00C47A]/40 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-[#00C47A] text-deep-forest rounded-xl hover:bg-[#00a868] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Send size={15} />
            </button>
          </form>
          <p className="text-[10px] font-body text-dark-muted mt-2 text-center">
            Demo mode — responses are grounded in Acme Industries plan data
          </p>
        </div>
      </div>
    </div>
  )
}
