import { useEffect, useRef } from 'react'
import { Quote } from 'lucide-react'

export default function Testimonials() {
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
    <section ref={sectionRef} id="testimonials" className="py-24 bg-dark-surface" aria-labelledby="founder-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="reveal border border-dark-border rounded-2xl p-8 sm:p-10 text-center">
          <Quote size={28} className="mx-auto mb-6 text-mint opacity-60" aria-hidden="true" />

          <blockquote>
            <p className="font-body text-base sm:text-lg text-dark-muted leading-relaxed italic whitespace-pre-line">
              "For years, I lived in the trenches of employee benefits…doing everything by manually in Excel.{'\n'}So I decided to build something of my own that could do way more than any VLookup ever could.
              {'\n\n'}BeneBots are the tools I needed a decade ago, so I made it myself.
              {'\n\n'}AI becomes powerful only when guided by real domain expertise. And that's the real difference."
            </p>
          </blockquote>

          <footer className="mt-8 border-t border-dark-border pt-6">
            <p className="font-display font-bold text-lg text-dark-text">Ty Mosher</p>
            <p className="text-sm font-body text-mint mt-1">Founder, Infinite Awesome Studios + BeneBots</p>
            <p className="text-xs font-body text-dark-muted mt-2">Employee Benefits Expert · AI Enabled Broker · 25 Years of Real World Experience</p>
          </footer>
        </div>
      </div>
    </section>
  )
}
