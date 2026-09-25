import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import SplitText from '../components/SplitText';
import WarpText from '../components/WarpText';
import { ReactLenis } from 'lenis/react';
import CursorGrid from '../components/CursorGrid';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {

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
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <ReactLenis root>
      <>
      <CursorGrid
        cellSize={70}
        color="#ffffff"
        radius={180}
        falloff="smooth"
        holdTime={80}
        fadeDuration={300}
        lineWidth={1}
        maxOpacity={0.6}
        fillOpacity={0}
        gridOpacity={0}
        cellRadius={0}
        clickPulse={true}
        pulseSpeed={800}
      />

      <div className="min-h-screen bg-transparent overflow-x-hidden selection:bg-white selection:text-black">
        {/* â”€â”€â”€â”€ Nav â”€â”€â”€â”€ */}
        <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'bg-black/40 backdrop-blur-2xl border-b border-white/[0.04] py-0' : 'bg-transparent border-transparent py-2'}`}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-6 animate-fade-in">
              <nav className="hidden md:flex items-center gap-8 mr-6">
                <button onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-bold text-[var(--color-muted-light)] hover:text-white transition-colors tracking-[0.2em] uppercase relative group">
                  Overview
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
                </button>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-bold text-[var(--color-muted-light)] hover:text-white transition-colors tracking-[0.2em] uppercase relative group">
                  Capabilities
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
                </button>
              </nav>

                <div className="relative group hidden md:block">
                  <button className="text-[10px] font-bold text-[var(--color-muted-light)] hover:text-white transition-colors tracking-[0.2em] uppercase flex items-center gap-1 h-full py-2">
                    GitHub
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full right-0 mt-4 w-48 bg-[#0a0a0a] border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-[999] shadow-2xl flex flex-col translate-y-2 group-hover:translate-y-0 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:content-['']">
                    <a href="https://github.com/bloodxsr/orca-frontend.git" target="_blank" rel="noopener noreferrer" className="px-4 py-3 text-xs text-[var(--color-muted)] hover:text-white hover:bg-white/5 transition-colors border-b border-white/5">Frontend Repository</a>
                    <a href="https://github.com/bloodxsr/orca-backend.git" target="_blank" rel="noopener noreferrer" className="px-4 py-3 text-xs text-[var(--color-muted)] hover:text-white hover:bg-white/5 transition-colors border-b border-white/5">Backend Repository</a>
                    <a href="https://github.com/bloodxsr/orca-ai.git" target="_blank" rel="noopener noreferrer" className="px-4 py-3 text-xs text-[var(--color-muted)] hover:text-white hover:bg-white/5 transition-colors">AI Engine Repository</a>
                  </div>
                </div>

              <Link to="/login" className="px-6 py-2.5 bg-white text-black text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
                Launch App
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        {/* â”€â”€â”€â”€ Hero â”€â”€â”€â”€ */}
        <section id="hero" className="relative min-h-screen flex items-center pt-32 pb-24 px-6 overflow-hidden">
          {/* Dynamic Abstract Background Elements */}
          <div className="absolute inset-0 pointer-events-none z-0">

            {/* Horizon fade */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-white/[0.015] to-transparent"></div>
          </div>

          <div className="relative z-10 w-full max-w-[95vw] lg:max-w-[1400px] mx-auto text-center">


            <h1 className="text-white mb-8 leading-[1.1] flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <WarpText
                text="Detect spills
Trace the vessel"
                color="#ffffff"
                warpStrength={0.05}
                warpScale={1.7}
                speed={0.55}
                pointerInfluence={0.42}
                pointerStrength={0.38}
                refraction={0.015}
                ripple
                fontSize={240}
                fontWeight={900}
                style={{ height: '60vh', width: '100%' }}
                fontFamily="inherit"
                letterSpacing={-0.03}
                lineHeight={0.9}
              />
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <button onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }} className="btn-ghost px-8 py-4 text-base flex items-center gap-2">
                Explore Capabilities
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          </div>
        </section>


        {/* â”€â”€â”€â”€ Dynamic Features Section â”€â”€â”€â”€ */}
        <section id="features" className="py-32 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-400 ease-out">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">Investigation-Grade Evidence</h2>
              <p className="text-[var(--color-muted)] max-w-2xl mx-auto text-lg">
                ORCA automates the entire attribution workflow, providing actionable insights with unparalleled precision.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 pt-10 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '100ms' }}>
                <div className="mb-8 opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tracking-wide group-hover:text-white/90 transition-colors">01 — Detection</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  Sentinel-1 SAR imagery is analyzed to detect and characterize potential oil slicks.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 pt-10 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out mt-0 md:mt-12 reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '300ms' }}>
                <div className="mb-8 opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tracking-wide group-hover:text-white/90 transition-colors">02 — Tracing</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  Wind and ocean-current data are used to simulate the spill backward and estimate its probable origin.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 pt-10 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out mt-0 md:mt-24 reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '500ms' }}>
                <div className="mb-8 opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tracking-wide group-hover:text-white/90 transition-colors">AIS Cross-Referencing</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  We query historical AIS transponder data to find vessels that intersected the spill's origin coordinates at the exact estimated time of discharge.
                </p>
              </div>
            </div>
          </div>
        </section>




        {/* â”€â”€â”€â”€ Workflow Section â”€â”€â”€â”€ */}
        <section id="workflow" className="py-32 px-6 relative z-50 border-t border-white/[0.05]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-24 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-400 ease-out">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">Operational Workflow</h2>
              <p className="text-[var(--color-muted)] max-w-2xl text-lg">
                A streamlined, three-phase intelligence pipeline designed for rapid response and definitive attribution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
              {/* Desktop connecting line */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-white/[0.05] z-0"></div>

              {/* Step 01 */}
              <div className="relative z-10 hover:z-50 group p-8 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '100ms' }}>
                <div className="text-5xl font-light text-white/[0.08] group-hover:text-white/80 transition-all duration-300 mb-6 font-mono group-hover:scale-105 origin-left">01</div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors">Detection</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  Sentinel-1 SAR imagery is analyzed to detect and characterize potential oil slicks.
                </p>

                {/* Deep Dive Floating Popover */}
                <div className="absolute top-[calc(100%+16px)] before:absolute before:-top-[24px] before:left-0 before:w-full before:h-[24px] before:content-[''] left-0 w-full sm:w-[130%] sm:-left-[15%] bg-[#050505] p-6 md:p-8 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 delay-[300ms] group-hover:delay-[100ms] flex flex-col justify-center border border-white/20 z-[999] shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[500px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <h4 className="text-white font-bold mb-3 tracking-wide text-lg">01 — Detection</h4>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-3">
                    Finding potential oil spills from satellite imagery.
                  </p>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-5">
                    ORCA uses Sentinel-1 SAR imagery to identify areas that may contain oil slicks, even when optical imagery is affected by clouds or limited visibility.
                  </p>
                  <ul className="text-[10px] text-white/50 font-mono space-y-2 border-l border-white/20 pl-3">
                    <li>// SAR IMAGE PREPROCESSING</li>
                    <li>// YOLO-BASED OIL-SPILL DETECTION</li>
                    <li>// OIL PROBABILITY ESTIMATION</li>
                    <li>// SLICK SEGMENTATION</li>
                    <li>// SPILL POLYGON AND CENTROID EXTRACTION</li>
                    <li>// SPILL AREA AND DETECTION CONFIDENCE CALCULATION</li>
                    <li>// OUTPUT: DETECTED SLICK, AREA, LOCATION, CONFIDENCE</li>
                  </ul>
                </div>
              </div>

              {/* Step 02 */}
              <div className="relative z-10 hover:z-50 group p-8 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '300ms' }}>
                <div className="text-5xl font-light text-white/[0.08] group-hover:text-white/80 transition-all duration-300 mb-6 font-mono group-hover:scale-105 origin-left">02</div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors">Tracing</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  Wind and ocean-current data are used to simulate the spill backward and estimate its probable origin.
                </p>

                {/* Deep Dive Floating Popover */}
                <div className="absolute top-[calc(100%+16px)] before:absolute before:-top-[24px] before:left-0 before:w-full before:h-[24px] before:content-[''] left-0 w-full sm:w-[130%] sm:-left-[15%] bg-[#050505] p-6 md:p-8 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 delay-[300ms] group-hover:delay-[100ms] flex flex-col justify-center border border-white/20 z-[999] shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[500px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <h4 className="text-white font-bold mb-3 tracking-wide text-lg">02 — Tracing</h4>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-3">
                    Reconstructing where the spill may have originated.
                  </p>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-5">
                    After detecting the slick, ORCA combines wind and ocean-current data with the observed spill geometry and estimated spill age. A physics-based backward particle-advection model simulates how the observed slick could have moved through the ocean.
                  </p>
                  <ul className="text-[10px] text-white/50 font-mono space-y-2 border-l border-white/20 pl-3">
                    <li>// WIND AND CURRENT INPUTS</li>
                    <li>// BACKWARD DRIFT SIMULATION</li>
                    <li>// MULTIPLE POSSIBLE PARTICLE PATHS</li>
                    <li>// PROBABLE ORIGIN ESTIMATION</li>
                    <li>// RELEASE-TIME WINDOW ESTIMATION</li>
                    <li>// ORIGIN PROBABILITY FIELD</li>
                    <li>// OUTPUT: ORIGIN ZONE, RELEASE WINDOW, ORIGIN CONFIDENCE</li>
                  </ul>
                </div>
              </div>

              {/* Step 03 */}
              <div className="relative z-10 hover:z-50 group p-8 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '500ms' }}>
                <div className="text-5xl font-light text-white/[0.08] group-hover:text-white/80 transition-all duration-300 mb-6 font-mono group-hover:scale-105 origin-left">03</div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors">Correlation</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  AIS vessel movements are analyzed around the estimated origin and time window to rank potential source vessels.
                </p>

                {/* Deep Dive Floating Popover */}
                <div className="absolute top-[calc(100%+16px)] before:absolute before:-top-[24px] before:left-0 before:w-full before:h-[24px] before:content-[''] left-0 w-full sm:w-[130%] sm:-left-[15%] bg-[#050505] p-6 md:p-8 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 delay-[300ms] group-hover:delay-[100ms] flex flex-col justify-center border border-white/20 z-[999] shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[500px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <h4 className="text-white font-bold mb-3 tracking-wide text-lg">03 — Correlation</h4>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-3">
                    Connecting the probable origin to vessel movements.
                  </p>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-5">
                    ORCA analyzes AIS vessel positions around the estimated origin and release window. Instead of choosing the nearest vessel, it evaluates multiple evidence signals. These signals are combined into an evidence-based compatibility score to rank potential source vessels.
                  </p>
                  <ul className="text-[10px] text-white/50 font-mono space-y-2 border-l border-white/20 pl-3">
                    <li>// DISTANCE FROM PROBABLE ORIGIN</li>
                    <li>// PRESENCE DURING THE ESTIMATED RELEASE WINDOW</li>
                    <li>// HEADING AND MOVEMENT DIRECTION</li>
                    <li>// VESSEL TRAJECTORY COMPATIBILITY</li>
                    <li>// TIME SPENT NEAR THE ORIGIN</li>
                    <li>// AIS DATA QUALITY</li>
                    <li>// OUTPUT: CANDIDATE VESSELS, EVIDENCE SCORE, EXPLANATION</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center reveal-on-scroll opacity-0 translate-y-8 transition-all duration-400 ease-out" style={{ transitionDelay: '700ms' }}>
              <p className="text-[var(--color-muted)] text-sm tracking-widest font-mono uppercase">
                ORCA Pipeline: Satellite Detection → Spill Characterization → Backward Drift → Probable Origin → AIS Correlation → Evidence Fusion → Candidate Ranking
              </p>
            </div>
          </div>
        </section>

        {/* Ã¢â€“Â  Architecture Section Ã¢â€“Â  */}
        <section id="architecture" className="py-32 px-6 relative z-40 border-t border-white/[0.05]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-24 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-400 ease-out md:text-right flex flex-col md:items-end">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">System Architecture</h2>
              <p className="text-[var(--color-muted)] max-w-2xl text-lg">
                A highly decoupled, cloud-native infrastructure built to handle massive oceanic datasets at scale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">
              <div className="relative z-10 hover:z-50 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-8 pt-8 group hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '100ms' }}>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4 font-mono group-hover:text-white transition-colors duration-300">Layer 1</div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors">Data Layer</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  Satellite imagery, wind, ocean currents and AIS vessel data provide the inputs.
                </p>

                {/* Deep Dive Floating Popover */}
                <div className="absolute top-[calc(100%+16px)] before:absolute before:-top-[24px] before:left-0 before:w-full before:h-[24px] before:content-[''] left-0 w-full sm:w-[130%] sm:-left-[15%] bg-[#050505] p-6 md:p-8 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 delay-[300ms] group-hover:delay-[100ms] flex flex-col justify-center border border-white/20 z-[999] shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[500px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <h4 className="text-white font-bold mb-3 tracking-wide text-lg">LAYER 1 — DATA INPUTS</h4>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-5">
                    The information ORCA needs.
                  </p>
                  <ul className="text-[10px] text-white/50 font-mono space-y-2 border-l border-white/20 pl-3">
                    <li>// SENTINEL-1 SAR: Used to detect and characterize potential oil slicks.</li>
                    <li>// WIND DATA: Helps estimate how the slick could have moved.</li>
                    <li>// OCEAN CURRENT DATA: Provides the physical movement of water needed for drift simulation.</li>
                    <li>// AIS VESSEL DATA: Provides vessel positions, movement and identity information for correlation.</li>
                    <li>// OIL-SLICK / LOOK-ALIKE DATASETS: Used for model development and evaluation.</li>
                  </ul>
                </div>
              </div>

              <div className="relative z-10 hover:z-50 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-8 pt-8 group hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '300ms' }}>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4 font-mono group-hover:text-white transition-colors duration-300">Layer 2</div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors">ORCA Intelligence</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  ML-based detection, drift simulation, origin estimation, AIS correlation and evidence scoring process the data.
                </p>

                {/* Deep Dive Floating Popover */}
                <div className="absolute top-[calc(100%+16px)] before:absolute before:-top-[24px] before:left-0 before:w-full before:h-[24px] before:content-[''] left-0 w-full sm:w-[130%] sm:-left-[15%] bg-[#050505] p-6 md:p-8 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 delay-[300ms] group-hover:delay-[100ms] flex flex-col justify-center border border-white/20 z-[999] shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[500px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <h4 className="text-white font-bold mb-3 tracking-wide text-lg">LAYER 2 — INTELLIGENCE</h4>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-5">
                    Turning raw data into investigation evidence.
                  </p>
                  <ul className="text-[10px] text-white/50 font-mono space-y-2 border-l border-white/20 pl-3">
                    <li>// 1. OIL DETECTION: YOLO-based detection identifies potential slicks from SAR.</li>
                    <li>// 2. SLICK CHARACTERIZATION: Extracts spill polygon, area, centroid.</li>
                    <li>// 3. DRIFT SIMULATION: Physics-based particle advection models the movement.</li>
                    <li>// 4. ORIGIN ESTIMATION: Generates a probable origin zone and release window.</li>
                    <li>// 5. AIS CANDIDATE GENERATION: Spatial and temporal filtering of vessels.</li>
                    <li>// 6. VESSEL COMPATIBILITY: XGBoost scoring for compatibility.</li>
                    <li>// 7. EVIDENCE FUSION: Combines available signals into candidate ranking.</li>
                  </ul>
                </div>
              </div>

              <div className="relative z-10 hover:z-50 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-8 pt-8 group md:col-span-2 lg:col-span-1 hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '500ms' }}>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4 font-mono group-hover:text-white transition-colors duration-300">Layer 3</div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors">Investigation Dashboard</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  An interactive map shows the oil slick, probable origin, vessel trajectories, candidate ranking and supporting evidence.
                </p>

                {/* Deep Dive Floating Popover */}
                <div className="absolute top-[calc(100%+16px)] before:absolute before:-top-[24px] before:left-0 before:w-full before:h-[24px] before:content-[''] left-0 w-full sm:w-[130%] sm:-left-[15%] bg-[#050505] p-6 md:p-8 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 delay-[300ms] group-hover:delay-[100ms] flex flex-col justify-center border border-white/20 z-[999] shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[500px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <h4 className="text-white font-bold mb-3 tracking-wide text-lg">LAYER 3 — DASHBOARD</h4>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-5">
                    What the investigator sees.
                  </p>
                  
                  <ul className="text-[10px] text-white/50 font-mono space-y-2 border-l border-white/20 pl-3">
                    <li>// INTERACTIVE MAP: Satellite imagery, detected slick, probable origin heatmap, trajectories, wind vectors.</li>
                    <li>// VESSEL INTELLIGENCE: AIS vessel positions, trajectories, candidate vessels, compatibility scores.</li>
                    <li>// EVIDENCE PANEL: Spatial, temporal, and trajectory evidence, origin compatibility, AIS quality.</li>
                  </ul>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mt-5">
                    ORCA converts disconnected data sources into one workflow: DATA → DETECTION → PHYSICS → AIS → EVIDENCE → INVESTIGATION
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ã¢â€“Â  Prototype Status Section Ã¢â€“Â  */}
        <section id="status" className="py-32 px-6 relative z-30 border-t border-white/[0.05]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-400 ease-out text-center">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">Prototype Status</h2>
              <p className="text-[var(--color-muted)] max-w-2xl mx-auto text-lg mb-12">
                Current progress and implementation state of the ORCA platform.
              </p>
              
              {/* Disclaimer */}
              <div className="max-w-4xl mx-auto rounded-2xl bg-red-950/40 border border-red-500/20 py-5 px-8 text-center z-10 relative backdrop-blur-xl shadow-[0_0_40px_rgba(239,68,68,0.05)] transition-all hover:bg-red-900/40 hover:border-red-500/40">
                <p className="text-red-200/90 font-medium tracking-wider text-sm flex items-center justify-center gap-3 uppercase">
                  Disclaimer: The AI Model is currently not available for public access at the moment
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="relative z-10 hover:z-50 border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm flex flex-col gap-4 group hover:border-white/20 transition-all duration-300">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-white font-bold text-sm tracking-widest group-hover:text-white/90">01 — OIL-SPILL DETECTION</h3>
                  <span className="text-green-400 border border-green-400/20 bg-green-400/10 px-2 py-1 text-[10px] uppercase font-mono rounded shrink-0">
                    Implemented
                  </span>
                </div>
                <p className="text-[var(--color-muted)] text-sm group-hover:text-white/60">Sentinel-1 imagery → ML detection → slick localization</p>
                
                
              </div>

              {/* Card 2 */}
              <div className="relative z-10 hover:z-50 border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm flex flex-col gap-4 group hover:border-white/20 transition-all duration-300">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-white font-bold text-sm tracking-widest group-hover:text-white/90">02 — DRIFT & ORIGIN ANALYSIS</h3>
                  <span className="text-green-400 border border-green-400/20 bg-green-400/10 px-2 py-1 text-[10px] uppercase font-mono rounded shrink-0">
                    Implemented
                  </span>
                </div>
                <p className="text-[var(--color-muted)] text-sm group-hover:text-white/60">Wind/current data → backward simulation → probable origin</p>
                
                
              </div>

              {/* Card 3 */}
              <div className="relative z-10 hover:z-50 border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm flex flex-col gap-4 group hover:border-white/20 transition-all duration-300">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-white font-bold text-sm tracking-widest group-hover:text-white/90">03 — AIS CORRELATION</h3>
                  <span className="text-amber-400 border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] uppercase font-mono rounded shrink-0">
                    Prototype
                  </span>
                </div>
                <p className="text-[var(--color-muted)] text-sm group-hover:text-white/60">Vessel filtering and candidate generation</p>
                
                
              </div>

              {/* Card 4 */}
              <div className="relative z-10 hover:z-50 border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm flex flex-col gap-4 group hover:border-white/20 transition-all duration-300">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-white font-bold text-sm tracking-widest group-hover:text-white/90">04 — EVIDENCE-BASED VESSEL SCORING</h3>
                  <span className="text-green-400 border border-green-400/20 bg-green-400/10 px-2 py-1 text-[10px] uppercase font-mono rounded shrink-0">
                    Implemented
                  </span>
                </div>
                <p className="text-[var(--color-muted)] text-sm group-hover:text-white/60">Spatial + temporal + trajectory compatibility</p>
                
                
              </div>

              {/* Card 5 */}
              <div className="relative z-10 hover:z-50 border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm flex flex-col gap-4 group hover:border-white/20 transition-all duration-300">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-white font-bold text-sm tracking-widest group-hover:text-white/90">05 — GIS INVESTIGATION DASHBOARD</h3>
                  <span className="text-green-400 border border-green-400/20 bg-green-400/10 px-2 py-1 text-[10px] uppercase font-mono rounded shrink-0">
                    Implemented
                  </span>
                </div>
                <p className="text-[var(--color-muted)] text-sm group-hover:text-white/60">Spill, origin, trajectories and candidate ranking</p>
                
                
              </div>

              {/* Card 6 */}
              <div className="relative z-10 hover:z-50 border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm flex flex-col gap-4 group hover:border-white/20 transition-all duration-300">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-white font-bold text-sm tracking-widest group-hover:text-white/90">06 — REAL-WORLD AIS VALIDATION</h3>
                  <span className="text-blue-400 border border-blue-400/20 bg-blue-400/10 px-2 py-1 text-[10px] uppercase font-mono rounded shrink-0">
                    Next Step
                  </span>
                </div>
                <p className="text-[var(--color-muted)] text-sm group-hover:text-white/60">Validate ORCA using historical real-world AIS data</p>
                
                
              </div>
            </div>
          </div>
        </section>
{/* ■ Footer ■ */}

        <footer className="bg-white/[0.02] backdrop-blur-xl pt-24 pb-12 px-6 relative z-10 border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
            <div className="w-full flex flex-col items-center justify-center gap-6 text-sm text-[var(--color-muted)]">
              <Logo showText={false} />
              <span>Â© 2026 ORCA. All rights reserved.</span>
            </div>

            <div className="w-full pt-6 flex flex-col items-center text-center">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white mb-3">Developed by Team Haven</p>
              <p className="text-xs text-[var(--color-muted)] tracking-widest font-mono">
                BIVASH <span className="opacity-30 mx-2">|</span> AARAV <span className="opacity-30 mx-2">|</span> SHAGUN <span className="opacity-30 mx-2">|</span> ABHINAV <span className="opacity-30 mx-2">|</span> TANISHA <span className="opacity-30 mx-2">|</span> BHAVYA
              </p>
            </div>
          </div>
        </footer>
      </div>
      </>
    </ReactLenis>
  );
}
















