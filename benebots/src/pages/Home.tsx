import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Capabilities from '../components/Capabilities'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-base text-dark-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-mint text-deep-forest px-4 py-2 rounded-lg font-display font-semibold text-sm z-[100]"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <hr className="section-divider" />
        <Features />
        <hr className="section-divider" />
        <HowItWorks />
        <hr className="section-divider" />
        <Capabilities />
        <hr className="section-divider" />
        <Testimonials />
        <hr className="section-divider" />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
