import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-void)] overflow-auto">
      {/* ──── Nav ──── */}
      <header className="fixed top-0 w-full z-50 glass-level-2">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[var(--color-signal-amber)]/20 flex items-center justify-center">
              <span className="text-[var(--color-signal-amber)] text-xs font-bold">OW</span>
            </div>
            <span className="text-[var(--color-text-white)] font-semibold text-sm tracking-tight">
              OilWatch AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="btn-ghost text-sm">Log in</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ──── Hero ──── */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[var(--color-signal-amber)]/[0.04] blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[300px] rounded-full bg-[var(--color-electric-cyan)]/[0.03] blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="badge-anomaly mb-6 mx-auto w-fit">
            SATELLITE-POWERED MARITIME INTELLIGENCE
          </div>
          <h1 className="text-headline-xl text-[var(--color-text-white)] mb-6">
            Detect oil spills.
            <br />
            <span className="text-[var(--color-signal-amber)]">Trace them back to the vessel.</span>
          </h1>
          <p className="text-body-lg text-[var(--color-muted-light)] max-w-2xl mx-auto mb-10">
            OilWatch AI combines satellite imagery, drift modelling, and AIS vessel tracking
            to identify potential sources of maritime oil spills — delivering investigation-grade
            evidence in minutes, not weeks.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Get Started
            </Link>
            <a href="#how-it-works" className="btn-ghost text-base px-8 py-3">
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ──── Problem Statement ──── */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline-md text-[var(--color-text-white)] mb-4">
            Manual spill attribution is slow, expensive, and unreliable
          </h2>
          <p className="text-body-lg text-[var(--color-muted-light)]">
            Today, identifying the vessel responsible for an oil spill can take weeks of manual
            analysis across fragmented datasets. AIS gaps, flag-state complexities, and vast ocean
            areas make traditional investigation methods fall short when time is critical.
          </p>
        </div>
      </section>

      {/* ──── How It Works ──── */}
      <section id="how-it-works" className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-headline-md text-[var(--color-text-white)] text-center mb-16">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', label: 'Satellite Detection', desc: 'SAR imagery detects oil slick polygons' },
              { step: '02', label: 'Drift Hindcast', desc: 'Reverse-model spill origin zone' },
              { step: '03', label: 'AIS Correlation', desc: 'Filter vessels in time-space window' },
              { step: '04', label: 'Vessel Ranking', desc: 'Score candidates on evidence features' },
              { step: '05', label: 'Evidence Dashboard', desc: 'Investigation-grade case file' },
            ].map((item) => (
              <div key={item.step} className="glass-level-1 rounded-xl p-5 text-center group hover:border-white/[0.12] transition-all">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-label-md text-[var(--color-signal-amber)]">STEP {item.step}</span>
                </div>
                <div className="text-headline-sm text-[var(--color-text-white)] text-sm mb-1">{item.label}</div>
                <div className="text-body-sm text-[var(--color-muted)]">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Feature Highlights ──── */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Satellite-based Spill Detection',
              desc: 'Automated analysis of synthetic aperture radar imagery to detect and delineate oil slick boundaries with confidence scoring.',
            },
            {
              title: 'Drift & Origin Estimation',
              desc: 'Reverse drift modelling reconstructs the spill\'s probable origin zone and time window using ocean current hindcasting.',
            },
            {
              title: 'AIS Vessel Correlation',
              desc: 'Spatial-temporal filtering of AIS transponder data identifies vessels that transited the origin zone during the event window.',
            },
            {
              title: 'Investigation-Grade Evidence',
              desc: 'Multi-factor scoring with full evidence breakdown — distance, trajectory, dwell time, AIS quality — for each candidate vessel.',
            },
          ].map((feature) => (
            <div key={feature.title} className="glass-level-2 rounded-xl p-6 hover:border-[var(--color-signal-amber)]/20 transition-all">
              <h3 className="text-headline-sm text-[var(--color-text-white)] mb-2">{feature.title}</h3>
              <p className="text-body-md text-[var(--color-muted-light)]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──── Trust Framing ──── */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-body-md text-[var(--color-muted)] italic">
            OilWatch AI provides evidence-based investigative leads for maritime environmental
            enforcement. Candidate rankings reflect statistical correlation — they are not
            legal proof of liability.
          </p>
        </div>
      </section>

      {/* ──── CTA Footer ──── */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline-lg text-[var(--color-text-white)] mb-6">
            Ready to investigate?
          </h2>
          <Link to="/login" className="btn-primary text-base px-10 py-3">
            Get Started
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between text-body-sm text-[var(--color-muted)]">
          <span>© 2026 OilWatch AI. All rights reserved.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[var(--color-text-white)] transition-colors">About</a>
            <a href="#" className="hover:text-[var(--color-text-white)] transition-colors">Contact</a>
            <Link to="/login" className="hover:text-[var(--color-text-white)] transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
