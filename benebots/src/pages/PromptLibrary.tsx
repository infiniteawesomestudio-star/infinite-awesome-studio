import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Send, Copy, Check } from 'lucide-react'

const CONTACT_EMAIL = 'ty@infiniteawesomestudio.com'

interface Prompt {
  id: string
  title: string
  category: string
  prompt: string
  bot: string
  botColor: string
}

const PROMPTS: Prompt[] = [
  {
    id: 'stewardship-exec-summary',
    title: 'Executive Summary Draft',
    category: 'Stewardship Reports',
    bot: 'Stewardship Studio',
    botColor: '#5B8FFF',
    prompt: `Write an executive summary for a stewardship report for [CLIENT NAME], a [INDUSTRY] employer with [# EMPLOYEES] employees on a [self-funded/fully-insured] plan. Total plan spend was $[AMOUNT] for the period, or $[PMPM]/member/month. Year-over-year trend is [+/-%]. The top three cost drivers are [DRIVER 1], [DRIVER 2], and [DRIVER 3]. Write in a tone appropriate for HR leadership and the CFO. Highlight what's working, what needs attention, and one strategic recommendation for renewal. Output in Markdown.`,
  },
  {
    id: 'hdhp-vs-ppo',
    title: 'HDHP vs PPO Plain-Language Comparison',
    category: 'Plan Compare',
    bot: 'Plan Compare',
    botColor: '#F7D154',
    prompt: `Compare the HDHP and PPO plans for an employee named [NAME] who is enrolling in [coverage tier: employee only / employee + spouse / family]. Their situation: [describe: healthy year expected / ongoing prescription / upcoming surgery / expecting a baby]. Show the full-year cost under each plan including: deductible, coinsurance, estimated out-of-pocket, premium difference, and HSA employer seed (HDHP: $[SEED AMOUNT]). Show the math clearly. End with a plain-language recommendation and the one trade-off they're accepting.`,
  },
  {
    id: 'oe-announcement',
    title: 'Open Enrollment Announcement Email',
    category: 'Open Enrollment',
    bot: 'OE Coach',
    botColor: '#FF6F61',
    prompt: `Write an open enrollment announcement email for [COMPANY NAME] employees. Open enrollment runs from [START DATE] to [END DATE]. This year's key changes are: [LIST CHANGES — e.g., new HDHP option added, dental maximum increased, HSA seed increased to $X]. Elections take effect [DATE]. The enrollment portal is [PORTAL NAME/URL]. Tone should be clear and friendly, not corporate-speak. Include a bullet summary of what's new, what stays the same, and what employees need to do before the deadline. Keep it under 300 words.`,
  },
  {
    id: 'eob-denial-appeal',
    title: 'EOB Denial Appeal Letter',
    category: 'Claims',
    bot: 'Claims Compass',
    botColor: '#F97316',
    prompt: `Help me write a formal internal appeal letter for a denied claim. Patient: [NAME]. Date of service: [DATE]. Provider: [PROVIDER NAME]. Denial reason code: [CODE] — [DENIAL REASON]. Service denied: [DESCRIPTION]. The clinical basis for this service is: [DOCTOR'S RATIONALE]. The plan document section that supports coverage is: [SECTION/PAGE if known]. Write a firm, professional appeal letter addressed to the plan's Appeals Department. Include: a clear statement of the request, clinical necessity argument, reference to plan language, and a request for expedited review if applicable. End with the next steps if this appeal is denied.`,
  },
  {
    id: 'fmla-eligibility-check',
    title: 'FMLA Eligibility Explainer',
    category: 'Leave & LOA',
    bot: 'LOA Navigator',
    botColor: '#A78BFA',
    prompt: `An employee named [NAME] is requesting leave for [REASON: serious health condition / birth of a child / care for a family member with a serious health condition]. They have worked at [COMPANY] for [MONTHS/YEARS] and average [HOURS] hours per week. The company has [# EMPLOYEES] employees. Explain whether this employee likely meets FMLA eligibility criteria (12 months of employment, 1,250 hours, 50-employee threshold). If eligible, outline: how many weeks of protected leave they may have, whether leave can run concurrently with any company leave policy, what notice and documentation requirements apply, and what HR needs to do within the required designation timeline.`,
  },
  {
    id: 'hsa-contribution-strategy',
    title: 'HSA Contribution Strategy',
    category: 'Open Enrollment',
    bot: 'OE Coach',
    botColor: '#FF6F61',
    prompt: `An employee is enrolled in an HDHP for plan year [YEAR] with employer HSA seed of $[SEED]. They are enrolled as [self-only / family] coverage. Walk them through: the IRS contribution limit for their coverage tier ([YEAR] limits), how much they can personally contribute after accounting for the employer seed, the tax benefit of maxing out the HSA (federal, FICA, and state if applicable), whether they should treat the HSA as a spending account or long-term investment account given their situation: [describe their health profile and financial situation], and the top 3 ways to spend HSA dollars they might not know about.`,
  },
  {
    id: 'renewal-strategy-brief',
    title: 'Renewal Strategy Brief',
    category: 'Stewardship Reports',
    bot: 'Stewardship Studio',
    botColor: '#5B8FFF',
    prompt: `Write a renewal strategy brief for [CLIENT NAME] ahead of their [MONTH/YEAR] renewal. Current carrier: [CARRIER]. Current plan structure: [DESCRIBE — e.g., one PPO, one HDHP with HSA]. Key data points: trend [+/-]%, PMPM $[AMOUNT], top cost driver [DRIVER]. The client's top priorities are: [LIST — e.g., hold rates flat, improve employee satisfaction, reduce ER utilization]. Recommend: (1) negotiating leverage points with the carrier, (2) one plan design change to consider, (3) one employee engagement action that costs nothing, and (4) the one risk to watch heading into renewal. Output in Markdown with clear section headers.`,
  },
  {
    id: 'cobra-notice-explainer',
    title: 'COBRA Explanation for Departing Employee',
    category: 'Claims',
    bot: 'Claims Compass',
    botColor: '#F97316',
    prompt: `An employee named [NAME] is [leaving voluntarily / being laid off / going on unpaid leave] effective [DATE]. Their current coverage is [PLAN NAME]. Their dependents on the plan: [LIST or "none"]. Explain to them in plain language: what COBRA is and when their current coverage ends, how long they have to elect COBRA ([qualifying event type] = [18 or 36] months), roughly what COBRA will cost (current employer + employee premium + 2% admin = approximately $[AMOUNT]/month — fill in if known), the 60-day election window and how it works, and whether there are better alternatives given their situation (marketplace, spouse's plan, Medicaid if income drops). Keep it human. This is a stressful moment.`,
  },
  {
    id: 'dependent-audit',
    title: 'Dependent Audit Communication',
    category: 'Open Enrollment',
    bot: 'OE Coach',
    botColor: '#FF6F61',
    prompt: `Write an employee communication for [COMPANY NAME] announcing a dependent eligibility audit. The audit will run from [START DATE] to [END DATE]. Employees must provide documentation verifying the eligibility of each dependent currently enrolled on the plan. Required documentation types: [LIST — e.g., marriage certificate, birth certificate, tax return, domestic partner affidavit]. Deadline to submit: [DATE]. Ineligible dependents will be removed effective [DATE]. Emphasize: this is routine, not accusatory, it protects the plan for everyone, and HR/[VENDOR NAME] is available to answer questions. Tone: factual, helpful, non-threatening.`,
  },
  {
    id: 'leave-interaction-state',
    title: 'State Leave + FMLA Stacking Explanation',
    category: 'Leave & LOA',
    bot: 'LOA Navigator',
    botColor: '#A78BFA',
    prompt: `An employee in [STATE: California / New York / Washington] is going on [parental leave / medical leave] starting [DATE]. They work [full-time / part-time at X hours/week] and have been employed for [DURATION]. Explain how federal FMLA, [STATE] state paid leave, and the company's own [PAID PARENTAL LEAVE / STD / LOA] policy interact. Specifically: (1) what runs concurrently vs. consecutively, (2) what is paid and for how long under each program, (3) what paperwork and timelines HR needs to track, and (4) when benefits continuation obligations apply. Flag any common compliance mistakes HR teams make in [STATE] for this leave type.`,
  },
  {
    id: 'benefits-orientation',
    title: 'New Hire Benefits Orientation Script',
    category: 'Open Enrollment',
    bot: 'Ask BeneBot',
    botColor: '#00C47A',
    prompt: `Write a benefits orientation script for new hires at [COMPANY NAME]. Cover: medical plan options ([PLAN NAMES]), dental ([CARRIER]), vision ([CARRIER]), HSA/FSA eligibility and contribution limits, 401(k) match ([MATCH FORMULA]), and any company-paid benefits (life insurance, EAP, etc.). Enrollment deadline: [X] days from hire date. Tone should be welcoming and jargon-free. Use analogies where helpful. End with a "top 3 things to do in your first week" checklist. Format as a spoken script a benefits coordinator would read to a group of new hires, not a policy document.`,
  },
  {
    id: 'no-surprises-act',
    title: 'No Surprises Act — Patient Rights Summary',
    category: 'Claims',
    bot: 'Claims Compass',
    botColor: '#F97316',
    prompt: `An employee received an unexpected bill from [OUT-OF-NETWORK PROVIDER / FACILITY] for [SERVICE TYPE] performed at an in-network [hospital / facility] on [DATE]. The amount billed is $[AMOUNT]. They have [PLAN TYPE] coverage through [CARRIER]. Explain: (1) whether the No Surprises Act likely applies to this situation and why, (2) what the employee's maximum cost-sharing obligation should be under NSA protections, (3) the exact steps to dispute the bill — including who to contact, what to say, and what documentation to keep, (4) the independent dispute resolution (IDR) process if the provider refuses to comply, and (5) how to file a complaint with CMS if the provider continues to balance bill.`,
  },
]

const CATEGORIES = Array.from(new Set(PROMPTS.map(p => p.category)))

function PromptCard({ prompt }: { prompt: Prompt }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(prompt.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden flex flex-col">
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <span
            className="text-[10px] font-body font-semibold uppercase tracking-widest px-2 py-0.5 rounded mb-2 inline-block"
            style={{ backgroundColor: `${prompt.botColor}18`, color: prompt.botColor }}
          >
            {prompt.bot}
          </span>
          <h3 className="font-display font-bold text-dark-text text-base leading-snug">{prompt.title}</h3>
        </div>
      </div>

      <div className="px-5 pb-3 flex-1">
        <p className="text-xs font-body text-dark-muted leading-relaxed font-mono bg-dark-base border border-dark-border rounded-xl p-3 line-clamp-4">
          {prompt.prompt}
        </p>
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={copy}
          className="flex items-center gap-2 text-xs font-body font-semibold px-3 py-2 rounded-lg border border-dark-border text-dark-muted hover:border-mint/40 hover:text-mint transition-all"
        >
          {copied ? <><Check size={13} className="text-mint" /> Copied!</> : <><Copy size={13} /> Copy prompt</>}
        </button>
      </div>
    </div>
  )
}

function EmailCapture() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          email,
          _subject: 'BeneBots | Prompt Library PDF Download',
          type: 'prompt-library',
          message: `${name} requested the Prompt Library PDF.`,
        }),
      })
    } catch {
      // silent — still show success
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center mx-auto mb-4">
          <Check size={20} className="text-mint" />
        </div>
        <p className="font-display font-bold text-dark-text text-lg mb-1">You're in.</p>
        <p className="text-sm font-body text-dark-muted max-w-sm mx-auto">
          Check your inbox — the PDF is on its way. If you don't see it within a few minutes, check your spam folder.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-label="PDF download form">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="pl-name" className="block text-xs font-body text-dark-muted mb-1.5 uppercase tracking-wider">Name</label>
          <input
            id="pl-name"
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            maxLength={100}
            className="w-full px-4 py-2.5 text-sm font-body bg-dark-base border border-dark-border rounded-xl text-dark-text placeholder-dark-muted focus:outline-none focus:border-mint/40 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="pl-email" className="block text-xs font-body text-dark-muted mb-1.5 uppercase tracking-wider">Work Email</label>
          <input
            id="pl-email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@brokerage.com"
            maxLength={254}
            className="w-full px-4 py-2.5 text-sm font-body bg-dark-base border border-dark-border rounded-xl text-dark-text placeholder-dark-muted focus:outline-none focus:border-mint/40 transition-colors"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-mint text-deep-forest font-display font-semibold py-3 px-5 rounded-xl hover:bg-[#00a868] transition-colors shadow-lg shadow-mint/20 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending…' : <><Send size={15} /> Send me the PDF</>}
      </button>
      <p className="text-[11px] font-body text-dark-muted text-center">
        No spam. Just the PDF and occasional benefits intel worth having.
      </p>
    </form>
  )
}

export default function PromptLibrary() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = activeCategory
    ? PROMPTS.filter(p => p.category === activeCategory)
    : PROMPTS

  return (
    <div className="min-h-screen bg-dark-base text-dark-text">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-24">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-1.5 mb-5">
            <span className="text-xs font-body text-mint uppercase tracking-widest">Prompt Library</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-dark-text mb-4">
            Benefits prompts that actually work.
          </h1>
          <p className="text-base font-body text-dark-muted max-w-xl mx-auto leading-relaxed">
            Copy-paste ready prompts for HR teams, benefits brokers, and anyone tired of staring at a blank chat window.
            Built by someone who's been in benefits for 25 years.
          </p>
        </div>

        {/* PDF Capture card */}
        <div className="bg-dark-card border border-mint/20 rounded-2xl p-7 mb-14 grid sm:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-mint mb-3 block">Free Download</span>
            <h2 className="font-display font-bold text-xl text-dark-text mb-2">Get the full library as a PDF.</h2>
            <p className="text-sm font-body text-dark-muted leading-relaxed">
              All {PROMPTS.length} prompts, formatted and print-ready. Drop it in your team's shared drive.
              We'll also send new prompts as we add them.
            </p>
          </div>
          <EmailCapture />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs font-body font-semibold px-3 py-1.5 rounded-full border transition-all ${
              activeCategory === null
                ? 'border-mint/60 text-mint bg-mint/8'
                : 'border-dark-border text-dark-muted hover:border-dark-border/80'
            }`}
          >
            All ({PROMPTS.length})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`text-xs font-body font-semibold px-3 py-1.5 rounded-full border transition-all ${
                activeCategory === cat
                  ? 'border-mint/60 text-mint bg-mint/8'
                  : 'border-dark-border text-dark-muted hover:border-dark-border/80'
              }`}
            >
              {cat} ({PROMPTS.filter(p => p.category === cat).length})
            </button>
          ))}
        </div>

        {/* Prompt grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => (
            <PromptCard key={p.id} prompt={p} />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center border-t border-dark-border pt-12">
          <p className="text-sm font-body text-dark-muted mb-4">
            Want these prompts to run automatically, without the copy-pasting?
          </p>
          <Link
            to="/#features"
            className="inline-flex items-center gap-2 bg-mint text-deep-forest font-display font-semibold py-3 px-6 rounded-xl hover:bg-[#00a868] transition-colors text-sm"
          >
            See BeneBots in action →
          </Link>
        </div>
      </main>
    </div>
  )
}
