import { useState, useEffect, useRef } from 'react'
import { ChevronDown, MessageSquare, Shield, Compass, Scale, HeartHandshake } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  bot: string
  botIcon: React.ElementType
  botColor: string
  category: string
}

const faqs: FAQItem[] = [
  {
    question: 'Who built BeneBots?',
    answer:
      "I'm Ty Mosher. I spent 9 years at Horizon Blue Cross Blue Shield analyzing benefit systems and fixing operational bottlenecks. Then 10+ years in HR consulting, watching the same problems repeat. I started teaching HR teams how to use AI tools (Copilot, Claude, ChatGPT) to cut their work in half. The response was immediate. But people kept asking: \"Can you make it just run automatically?\" That's what BeneBots does. It's the automated version of the manual workflows I teach — built by someone who's spent 20 years on the HR side of benefits administration.",
    bot: 'MyBenefitsGuy',
    botIcon: MessageSquare,
    botColor: '#00C47A',
    category: 'About BeneBots',
  },
  {
    question: 'How is BeneBots different from using ChatGPT or Copilot?',
    answer:
      "ChatGPT and Copilot are great tools — I recommend them all the time. They're free or under $20/month and solve 80% of benefits admin problems. But they require manual prompting every time. If you'd rather not prompt an AI tool every Monday morning, BeneBots is for you. Think of it this way: ChatGPT and Copilot are shovels you pick up and use. BeneBots is the excavator that does the shoveling automatically. Most teams start with ChatGPT or Copilot (free, immediate). Some graduate to BeneBots (automated, 24/7) when they want to stop manually prompting.",
    bot: 'MyBenefitsGuy',
    botIcon: MessageSquare,
    botColor: '#00C47A',
    category: 'About BeneBots',
  },
  {
    question: "Why is it called 'the shovel'?",
    answer:
      "Because it's a tool, not a hype cycle. The benefits industry moves slower than tech because it should. Compliance has real consequences. But skepticism toward hype isn't the same as skepticism toward tools that actually work. I built BeneBots as a practitioner who got tired of digging with my hands. It's not revolutionary. It's just better.",
    bot: 'MyBenefitsGuy',
    botIcon: MessageSquare,
    botColor: '#00C47A',
    category: 'About BeneBots',
  },
  {
    question: "Is my client's benefit plan data secure?",
    answer:
      'Every piece of client data lives in your environment. We don\'t store plan documents on shared infrastructure. Agents operate within your access controls, with audit trails on every interaction. For clients with elevated requirements, we support HIPAA Business Associate Agreements and can scope isolated deployments. We treat employee benefits data the way it deserves to be treated: like it belongs to your clients, not us.',
    bot: 'ComplianceBot',
    botIcon: Shield,
    botColor: '#5B8FFF',
    category: 'Security & HIPAA',
  },
  {
    question: "What's the HSA contribution limit for 2026?",
    answer:
      'For 2026, the IRS HSA contribution limit is $4,300 for self-only HDHP coverage and $8,550 for family coverage. Catch-up contributions for account holders 55 and older add $1,000 on top of either limit. These are the employee-plus-employer combined limits, so if your employer seeds $750, your personal contribution ceiling drops accordingly. Always verify with the current IRS Revenue Procedure for the plan year.',
    bot: 'Ask BeneBot',
    botIcon: MessageSquare,
    botColor: '#00C47A',
    category: 'HSA / Spending Accounts',
  },
  {
    question: 'How long does COBRA coverage last?',
    answer:
      'Standard COBRA continuation coverage runs 18 months for most qualifying events like job loss, reduced hours, and similar. It extends to 36 months for dependents who lose coverage due to a covered employee\'s death, divorce, or Medicare entitlement, or when a dependent child ages off the plan. A second qualifying event during the initial 18-month period can also trigger the 36-month maximum. State mini-COBRA laws vary and may apply to smaller employers not covered by federal COBRA.',
    bot: 'Ask BeneBot',
    botIcon: MessageSquare,
    botColor: '#00C47A',
    category: 'COBRA',
  },
  {
    question: 'What happens during open enrollment if an employee misses the window?',
    answer:
      'Outside open enrollment, employees can only change elections after a qualifying life event such as marriage, divorce, birth or adoption of a child, or loss of other coverage. The change must be consistent with the event, and most plans require notification within 30 days. Employers can also establish a special enrollment period. I walk employees through all of this during OE so they\'re not stuck scrambling in February.',
    bot: 'OE Coach',
    botIcon: Compass,
    botColor: '#FF6F61',
    category: 'Open Enrollment',
  },
  {
    question: 'How does BeneBots compare to just using ChatGPT for benefits questions?',
    answer:
      'ChatGPT answers from generic training data. It doesn\'t know your client\'s actual deductibles, their carrier network, or whether they offer an HSA seed. I\'m trained on your specific plan documents and carrier contracts. That\'s the difference between "typically, a PPO deductible is $X" and "for Acme Industries BlueChoice PPO, your in-network deductible is $1,500 per individual." One is a search engine. The other is a benefits professional who never forgets the plan.',
    bot: 'Plan Compare',
    botIcon: Scale,
    botColor: '#F7D154',
    category: 'About BeneBots',
  },
  {
    question: 'Can a bot really handle FMLA and state leave questions?',
    answer:
      'LOA Navigator handles the educational layer: what FMLA covers, how your state\'s paid leave stacks with federal protections, what paperwork HR typically needs. What it doesn\'t do is give legal advice or make coverage determinations. That distinction matters and we\'re explicit about it in every response. What you get is an employee who shows up to the HR conversation already understanding the framework, which cuts every leave conversation in half.',
    bot: 'LOA Navigator',
    botIcon: HeartHandshake,
    botColor: '#00a868',
    category: 'Leave / LOA',
  },
  {
    question: 'How long does setup actually take?',
    answer:
      'The 4–8 week window covers everything: discovery, data ingestion, agent build, review, and deployment. The discovery session is typically 90 minutes. We handle the technical work. Your team reviews one draft before we go live. If we miss 8 weeks, we keep building at no additional charge. That\'s in writing.',
    bot: 'Ask BeneBot',
    botIcon: MessageSquare,
    botColor: '#00C47A',
    category: 'About BeneBots',
  },
]

function FAQItem({ item, isOpen, onToggle, index }: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  const Icon = item.botIcon
  return (
    <div
      className="reveal border border-dark-border rounded-xl overflow-hidden transition-colors hover:border-dark-border/80"
      style={{ transitionDelay: `${index * 0.07}s` }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 p-5 text-left bg-dark-card hover:bg-dark-card-hover transition-colors"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        {/* Category badge */}
        <span
          className="flex-shrink-0 text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded mt-0.5 hidden sm:inline-block"
          style={{ backgroundColor: `${item.botColor}18`, color: item.botColor }}
        >
          {item.category}
        </span>

        <span className="flex-1 font-display font-semibold text-dark-text text-sm sm:text-base leading-snug">
          {item.question}
        </span>

        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-dark-muted mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div id={`faq-answer-${index}`} className="border-t border-dark-border bg-dark-card/50">
          {/* Bot header */}
          <div className="flex items-center gap-2.5 px-5 pt-4 pb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${item.botColor}1a`, border: `1px solid ${item.botColor}33` }}
            >
              <Icon size={14} style={{ color: item.botColor }} />
            </div>
            <span className="text-xs font-body font-semibold" style={{ color: item.botColor }}>
              {item.bot} answering:
            </span>
          </div>

          <p className="px-5 pb-5 text-sm font-body text-dark-muted leading-relaxed">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const items = el.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    items.forEach(i => io.observe(i))
    return () => io.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="faq" className="py-24 px-4 sm:px-6 max-w-4xl mx-auto" aria-labelledby="faq-heading">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="reveal inline-flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-1.5 mb-5">
          <span className="text-xs font-body text-mint uppercase tracking-widest">FAQ</span>
        </div>
        <h2 id="faq-heading" className="reveal font-display font-bold text-3xl sm:text-4xl text-dark-text mb-4" style={{ transitionDelay: '0.1s' }}>
          The questions BeneBots already has answers for
        </h2>
        <p className="reveal text-base font-body text-dark-muted max-w-lg mx-auto" style={{ transitionDelay: '0.2s' }}>
          Each answer is from a specific bot, because different questions deserve different specialists.
        </p>
      </div>

      {/* FAQ list */}
      <div className="space-y-3">
        {faqs.map((item, i) => (
          <FAQItem
            key={item.question}
            item={item}
            index={i}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  )
}
