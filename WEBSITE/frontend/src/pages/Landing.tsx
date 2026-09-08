import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import PixelSnow from '../components/PixelSnow';

export default function Landing() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [loadingText, setLoadingText] = useState('ESTABLISHING CONNECTION...');

  useEffect(() => {
    // Slower rotating texts sequence with fewer items
    const texts = [
      'ESTABLISHING CONNECTION...',
      'INITIALIZING INTERFACE...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 1200); // slower rotation

    // Simulate preloading resources
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2500); // slightly longer to let texts play out

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up-show');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* ──── Preloader ──── */}
      <div className={`fixed inset-0 z-[999] bg-[var(--color-void)] flex flex-col items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.85,0,0.15,1)] ${isLoaded ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="flex flex-col items-center justify-center overflow-hidden h-12">
          <div key={loadingText} className="text-[var(--color-signal-amber)] font-mono text-xs uppercase tracking-[0.4em] animate-fade-in leading-none">{loadingText}</div>
        </div>
      </div>

      <div className="min-h-screen bg-[var(--color-void)] overflow-x-hidden selection:bg-[var(--color-signal-amber)] selection:text-black">
        {/* ──── Nav ──── */}
        <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/40 backdrop-blur-2xl border-b border-white/[0.04] py-0' : 'bg-transparent border-transparent py-2'}`}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-6 animate-fade-in">
              <nav className="hidden md:flex items-center gap-6 mr-4">
                <button onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-medium text-[var(--color-muted)] hover:text-white transition-colors tracking-wide uppercase">Overview</button>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-medium text-[var(--color-muted)] hover:text-white transition-colors tracking-wide uppercase">Capabilities</button>
              </nav>
              <Link to="/login" className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-colors shadow-lg shadow-black/20 hover:shadow-white/5">
                Launch App
              </Link>
            </div>
          </div>
        </header>

        {/* ──── Hero ──── */}
        <section id="hero" className="relative min-h-screen flex items-center pt-32 pb-24 px-6 overflow-hidden">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <PixelSnow 
            color="#ffffff"
            flakeSize={0.01}
            minFlakeSize={1.25}
            pixelResolution={200}
            speed={1.25}
            density={0.3}
            direction={125}
            brightness={1}
            depthFade={8}
            farPlane={20}
            gamma={0.4545}
            variant="square"
          />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-[100%] bg-[var(--color-signal-amber)]/[0.03] blur-[100px] animate-pulse-glow" />
          <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full bg-[var(--color-electric-cyan)]/[0.02] blur-[120px] animate-float-slow" />
          <div className="absolute bottom-0 right-1/4 w-[700px] h-[500px] rounded-[100%] bg-[#5227FF]/[0.02] blur-[120px] animate-float" />
          
          {/* subtle grid overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50"></div>
          
          {/* Horizon glow */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-signal-amber)]/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-[var(--color-signal-amber)]/[0.015] to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-level-1 border border-[var(--color-signal-amber)]/20 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <span className="w-2 h-2 rounded-full bg-[var(--color-signal-amber)] animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-widest text-[var(--color-signal-amber)] uppercase">Next-Gen Maritime Intelligence</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 animate-slide-up leading-[1.1]" style={{ animationDelay: '0.2s' }}>
            Detect spills. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-signal-amber)] to-[#ff7e5f]">
              Trace the vessel.
            </span>
          </h1>
          
          <p className="text-xl text-[var(--color-muted-light)] max-w-3xl mx-auto mb-12 animate-slide-up font-light leading-relaxed" style={{ animationDelay: '0.3s' }}>
            ORCA fuses automated satellite SAR detection with oceanic drift modelling and AIS cross-referencing. Transform weeks of maritime investigation into minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/login" className="px-8 py-4 bg-gradient-to-r from-[var(--color-signal-amber)] to-amber-500 text-black font-bold rounded-full hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 transition-all duration-300">
              Access Platform
            </Link>
            <button onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }} className="px-8 py-4 glass-level-1 border border-white/10 text-white font-medium rounded-full hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center gap-2">
              Explore Capabilities
              <svg className="w-4 h-4 text-[var(--color-signal-amber)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ──── Dynamic Features Section ──── */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-1000 ease-out">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">Investigation-Grade Evidence</h2>
            <p className="text-[var(--color-muted)] max-w-2xl mx-auto text-lg">
              ORCA automates the entire attribution workflow, providing actionable insights with unparalleled precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group glass-level-2 p-10 rounded-3xl hover:bg-[#1c1c1f] transition-all border border-white/[0.04] hover:border-[var(--color-electric-cyan)]/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] duration-500 relative overflow-hidden reveal-on-scroll opacity-0 translate-y-8 ease-out" style={{ transitionDelay: '100ms' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-electric-cyan)]/10 blur-[50px] group-hover:bg-[var(--color-electric-cyan)]/20 transition-all duration-500"></div>
              
              <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center mb-8 border border-[var(--color-electric-cyan)]/20 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-7 h-7 text-[var(--color-electric-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Satellite Detection</h3>
              <p className="text-[var(--color-muted)] text-base leading-relaxed">
                Automated Sentinel-1 SAR analysis identifies anomalies on the ocean surface. Our computer vision models differentiate oil slicks from look-alikes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group glass-level-2 p-10 rounded-3xl hover:bg-[#1c1c1f] transition-all border border-white/[0.04] hover:border-[var(--color-signal-amber)]/30 hover:shadow-[0_0_40px_rgba(245,158,11,0.1)] duration-500 relative overflow-hidden mt-0 md:mt-12 reveal-on-scroll opacity-0 translate-y-8 ease-out" style={{ transitionDelay: '300ms' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-signal-amber)]/10 blur-[50px] group-hover:bg-[var(--color-signal-amber)]/20 transition-all duration-500"></div>

              <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center mb-8 border border-[var(--color-signal-amber)]/20 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-7 h-7 text-[var(--color-signal-amber)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Reverse Drift Modelling</h3>
              <p className="text-[var(--color-muted)] text-base leading-relaxed">
                Using real-time oceanic currents and wind data, we calculate the precise origin point of the spill by simulating its drift backwards in time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group glass-level-2 p-10 rounded-3xl hover:bg-[#1c1c1f] transition-all border border-white/[0.04] hover:border-[#72d0d5]/30 hover:shadow-[0_0_40px_rgba(114,208,213,0.1)] duration-500 relative overflow-hidden mt-0 md:mt-24 reveal-on-scroll opacity-0 translate-y-8 ease-out" style={{ transitionDelay: '500ms' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#72d0d5]/10 blur-[50px] group-hover:bg-[#72d0d5]/20 transition-all duration-500"></div>

              <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center mb-8 border border-[#72d0d5]/20 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-7 h-7 text-[#72d0d5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">AIS Cross-Referencing</h3>
              <p className="text-[var(--color-muted)] text-base leading-relaxed">
                We query historical AIS transponder data to find vessels that intersected the spill's origin coordinates at the exact estimated time of discharge.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* ──── Footer ──── */}
      <footer className="bg-[#09090b] pt-24 pb-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-[var(--color-muted)]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Logo showText={true} />
            <span className="hidden md:block w-px h-6 bg-white/10"></span>
            <span>© 2026 ORCA Intelligence. All rights reserved.</span>
          </div>
          <div className="flex gap-8 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:contact@orca.ai" className="hover:text-[var(--color-signal-amber)] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
