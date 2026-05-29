import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED = [
  "What's the difference between the HDHP and PPO?",
  "How much does Acme put in my HSA?",
  "I just had a baby. What do I do?",
  "When is open enrollment?",
]

const FOLLOW_UPS: { keywords: string[]; suggestions: string[] }[] = [
  {
    keywords: ['hdhp', 'ppo', 'deductible', 'plan', 'coinsurance', 'oopm', 'out-of-pocket'],
    suggestions: ["How much does Acme put in my HSA?", "Which plan is better if I barely use healthcare?", "What's the out-of-pocket max on the PPO?"],
  },
  {
    keywords: ['hsa', 'health savings', 'contribution', 'seed', 'limit'],
    suggestions: ["Can I use my HSA for dental and vision?", "What happens to my HSA if I switch to the PPO?", "What's the HSA family limit for 2026?"],
  },
  {
    keywords: ['fsa', 'flexible spending', 'carryover', 'dependent care'],
    suggestions: ["Can I have both an HSA and FSA?", "What can I spend my FSA on?", "When does my FSA carryover expire?"],
  },
  {
    keywords: ['baby', 'newborn', 'birth', 'parental', 'maternity', 'paternity', 'child'],
    suggestions: ["How long is Acme's paid parental leave?", "When do I need to add my baby to insurance?", "Does FMLA run at the same time as parental leave?"],
  },
  {
    keywords: ['cobra', 'lose coverage', 'leaving', 'job loss', 'continuation'],
    suggestions: ["How long does COBRA coverage last?", "How much does COBRA cost?", "Are there alternatives to COBRA?"],
  },
  {
    keywords: ['open enrollment', 'oe', 'enroll', 'election', 'change plan'],
    suggestions: ["What if I miss open enrollment?", "When does open enrollment happen at Acme?", "Can I change my HSA election during the year?"],
  },
  {
    keywords: ['401k', 'retirement', 'match', 'roth', 'contribution'],
    suggestions: ["What's Acme's 401(k) match?", "Is there a Roth 401(k) option?", "When am I vested in the match?"],
  },
  {
    keywords: ['dental', 'vision', 'vsp', 'delta', 'orthodont'],
    suggestions: ["Does dental cover orthodontics?", "What's the annual dental maximum?", "Is vision included with medical or separate?"],
  },
]

function getFollowUps(lastReply: string): string[] {
  const lower = lastReply.toLowerCase()
  for (const group of FOLLOW_UPS) {
    if (group.keywords.some(k => lower.includes(k))) {
      return group.suggestions
    }
  }
  return ["What other benefits does Acme offer?", "How does the HSA work?", "What happens during open enrollment?"]
}

const WORKER_URL = import.meta.env.VITE_WORKER_URL as string | undefined
const WORKER_TOKEN = import.meta.env.VITE_WORKER_TOKEN as string | undefined

async function callWorker(messages: Message[]): Promise<string> {
  if (!WORKER_URL || !WORKER_TOKEN) {
    throw new Error('WORKER_NOT_CONFIGURED')
  }
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WORKER_TOKEN}`,
    },
    body: JSON.stringify({ botId: 'ask', messages, maxTokens: 1024 }),
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
  const [followUps, setFollowUps] = useState<string[]>([])
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
    setFollowUps([])
    setLoading(true)
    setError(null)
    try {
      const reply = await callWorker(next)
      setMessages(m => [...m, { role: 'assistant', content: reply }])
      setFollowUps(getFollowUps(reply))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown'
      if (msg.includes('429')) {
        setError('Too many requests. Give it a moment and try again.')
      } else {
        setError('Something went wrong. Please try again in a moment.')
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
                <p className="font-display font-bold text-dark-text text-lg mb-1">Ask BeneBot | Acme Industries</p>
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

        {/* Follow-up suggestions */}
        {followUps.length > 0 && !loading && (
          <div className="border-t border-dark-border px-4 pt-3 pb-1 flex flex-wrap gap-2">
            {followUps.map(q => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="text-xs font-body text-dark-muted border border-dark-border rounded-full px-3 py-1.5 hover:border-[#00C47A]/40 hover:text-[#00C47A] transition-all bg-dark-base"
              >
                {q}
              </button>
            ))}
          </div>
        )}

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
            Demo mode. Responses are grounded in Acme Industries plan data
          </p>
        </div>
      </div>
    </div>
  )
}
