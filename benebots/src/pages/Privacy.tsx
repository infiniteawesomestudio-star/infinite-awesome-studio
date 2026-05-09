import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const CONTACT_EMAIL = 'ty@infiniteawesomestudio.com'
const LAST_UPDATED = 'May 8, 2026'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-dark-base text-dark-text">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-body text-dark-muted hover:text-mint transition-colors mb-10">
          <ArrowLeft size={16} /> Back to BeneBots
        </Link>

        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2">Privacy Policy</h1>
        <p className="text-sm font-body text-dark-muted mb-12">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-10 text-sm font-body text-dark-muted leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-lg text-dark-text mb-3">Who We Are</h2>
            <p>
              BeneBots is a product of Infinite Awesome Studio, founded by Ty Mosher. This policy explains what data we collect when you visit <strong className="text-dark-text">benebots.pages.dev</strong> and use our demo tools, and how we handle it.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-dark-text mb-3">What We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-dark-text">Contact form submissions</strong> including name, email address, and message content you voluntarily provide through our contact or newsletter forms. These are delivered via FormSubmit.co.</li>
              <li><strong className="text-dark-text">Demo conversations</strong> including text you type into any BeneBot demo. Conversations are sent to Anthropic's Claude API for processing and are not stored on our servers after the session ends.</li>
              <li><strong className="text-dark-text">Basic analytics</strong> via Cloudflare Web Analytics or similar privacy-respecting tools that do not use cookies or track individuals.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-dark-text mb-3">What We Don't Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We do not sell, rent, or share your personal information with third parties for marketing purposes.</li>
              <li>We do not use tracking cookies or third-party advertising pixels.</li>
              <li>We do not collect protected health information (PHI). Demo conversations are for illustration only and should not include real employee data.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-dark-text mb-3">Third-Party Services</h2>
            <p className="mb-3">We use the following services to operate BeneBots:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-dark-text">Cloudflare</strong> for hosting, CDN, and DNS. Subject to <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-mint hover:underline">Cloudflare's Privacy Policy</a>.</li>
              <li><strong className="text-dark-text">Anthropic (Claude API)</strong> which powers BeneBot demo conversations. Subject to <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-mint hover:underline">Anthropic's Privacy Policy</a>.</li>
              <li><strong className="text-dark-text">FormSubmit.co</strong> which processes contact form submissions.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-dark-text mb-3">Data Retention</h2>
            <p>Contact form submissions are retained in our email inbox for as long as needed to respond to your inquiry. Demo conversations are ephemeral and not stored after your browser session ends.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-dark-text mb-3">Your Rights</h2>
            <p>You can request access to, correction of, or deletion of any personal data we hold about you by emailing us at the address below. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-dark-text mb-3">Children's Privacy</h2>
            <p>BeneBots is not directed at children under 13. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-dark-text mb-3">Changes to This Policy</h2>
            <p>We may update this policy from time to time. Changes will be posted on this page with an updated revision date.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-dark-text mb-3">Contact</h2>
            <p>
              Questions about this policy? Email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-mint hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
