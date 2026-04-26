import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-base/95 backdrop-blur-md border-b border-dark-border shadow-lg shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group" aria-label="BeneBots home">
          <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center shadow-lg shadow-mint/30 group-hover:shadow-mint/50 transition-shadow">
            <span className="text-dark-base font-display font-bold text-sm">B</span>
          </div>
          <span className="font-display font-bold text-dark-text text-lg tracking-tight">
            Bene<span className="text-mint">Bots</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {links.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-body text-dark-muted hover:text-mint transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://benebots.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-body text-dark-muted hover:text-mint transition-colors"
          >
            App ↗
          </a>
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#contact"
            className="text-sm font-body font-medium text-dark-text border border-dark-border px-4 py-2 rounded-lg hover:border-mint/40 hover:text-mint transition-all"
          >
            Schedule Consultation
          </a>
          <a
            href="#demo"
            className="text-sm font-body font-medium bg-mint text-deep-forest px-4 py-2 rounded-lg hover:bg-[#00a868] transition-colors shadow-md shadow-mint/20"
          >
            See Demo
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-dark-text p-2 rounded-lg hover:bg-dark-card transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-surface border-b border-dark-border px-4 pb-5 pt-2">
          <nav className="flex flex-col gap-3" aria-label="Mobile navigation">
            {links.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-body text-dark-muted hover:text-mint py-1 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-dark-border">
            <a
              href="#contact"
              className="text-sm font-body text-center font-medium text-dark-text border border-dark-border px-4 py-2.5 rounded-lg hover:border-mint/40 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              Schedule Consultation
            </a>
            <a
              href="#demo"
              className="text-sm font-body text-center font-medium bg-mint text-deep-forest px-4 py-2.5 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              See Demo
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
