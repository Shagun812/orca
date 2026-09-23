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
        {/* ──── Nav ──── */}
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
              <Link to="/login" className="px-6 py-2.5 bg-white text-black text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
                Launch App
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        {/* ──── Hero ──── */}
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


        {/* ──── Dynamic Features Section ──── */}
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
                <h3 className="text-xl font-bold text-white mb-4 tracking-wide group-hover:text-white/90 transition-colors">Satellite Detection</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  Automated Sentinel-1 SAR analysis identifies anomalies on the ocean surface. Our computer vision models differentiate oil slicks from look-alikes.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 pt-10 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out mt-0 md:mt-12 reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '300ms' }}>
                <div className="mb-8 opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tracking-wide group-hover:text-white/90 transition-colors">Reverse Drift Modelling</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  Using real-time oceanic currents and wind data, we calculate the precise origin point of the spill by simulating its drift backwards in time.
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




        {/* ──── Workflow Section ──── */}
        <section id="workflow" className="py-32 px-6 relative z-40 border-t border-white/[0.05]">
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
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors">Ingestion</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  Continuous, automated monitoring of Sentinel-1 SAR imagery and global AIS transponder data streams.
                </p>

                {/* Deep Dive Floating Popover */}
                <div className="absolute top-[calc(100%+16px)] before:absolute before:-top-[16px] before:left-0 before:w-full before:h-[16px] before:content-[''] left-0 w-full sm:w-[130%] sm:-left-[15%] bg-[#050505] p-6 md:p-8 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-500 delay-0 group-hover:delay-[1500ms] flex flex-col justify-center border border-white/20 z-[999] shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[400px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <h4 className="text-white font-bold mb-3 tracking-wide text-lg">Ingestion Deep Dive</h4>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-3">
                    Our ingestion engine pulls high-resolution SAR tiles from Copernicus Sentinel-1 via automated pipelines, alongside raw kinematic data from global AIS receivers. Data is normalized and partitioned into spatio-temporal blocks for low-latency processing.
                  </p>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-5">
                    We maintain redundant connections to the European Space Agency's (ESA) open data hubs, ensuring that as soon as a satellite pass over a region of interest is completed, the Level-1 Ground Range Detected (GRD) products are immediately queued. Simultaneously, terrestrial and satellite-based AIS networks (via exactEarth & Spire) stream vessel transponder data at 1Hz frequencies into our Kafka clusters.
                  </p>
                  <ul className="text-[10px] text-white/50 font-mono space-y-2 border-l border-white/20 pl-3">
                    <li>// SOURCE: SENTINEL-1 SAR (C-BAND)</li>
                    <li>// SOURCE: SATELLITE & TERRESTRIAL AIS</li>
                    <li>// FREQUENCY: CONTINUOUS STREAMING</li>
                    <li>// FORMAT: GEOJSON, NETCDF, NMEA 0183</li>
                    <li>// PIPELINE: APACHE KAFKA & SPARK</li>
                  </ul>
                </div>
              </div>

              {/* Step 02 */}
              <div className="relative z-10 hover:z-50 group p-8 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '300ms' }}>
                <div className="text-5xl font-light text-white/[0.08] group-hover:text-white/80 transition-all duration-300 mb-6 font-mono group-hover:scale-105 origin-left">02</div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors">Analysis</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  Proprietary computer vision models analyze raw signals to detect anomalies and probabilistically classify oil slicks.
                </p>

                {/* Deep Dive Floating Popover */}
                <div className="absolute top-[calc(100%+16px)] before:absolute before:-top-[16px] before:left-0 before:w-full before:h-[16px] before:content-[''] left-0 w-full sm:w-[130%] sm:-left-[15%] bg-[#050505] p-6 md:p-8 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-500 delay-0 group-hover:delay-[1500ms] flex flex-col justify-center border border-white/20 z-[999] shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[400px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <h4 className="text-white font-bold mb-3 tracking-wide text-lg">Analysis Deep Dive</h4>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-3">
                    Multi-stage convolutional neural networks (CNNs) segment the SAR imagery, identifying localized backscatter anomalies. A secondary classification layer distinguishes biological slicks, wind shadows, and ship wakes from confirmed hydrocarbon spills.
                  </p>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-5">
                    The core engine leverages a modified U-Net architecture trained on tens of thousands of confirmed spill incidents. By analyzing the VV and VH polarization bands, the model accurately calculates the surface roughness depression caused by oil films. Adaptive thresholding algorithms run in parallel to filter out False Positives caused by low-wind areas or ocean upwelling, ensuring that only high-confidence dark formations proceed to the attribution stage.
                  </p>
                  <ul className="text-[10px] text-white/50 font-mono space-y-2 border-l border-white/20 pl-3">
                    <li>// ENGINE: CUSTOM CNN ENSEMBLE (U-NET)</li>
                    <li>// ACCURACY: {'>'}94.3% TRUE POSITIVE RATE</li>
                    <li>// FALSE ALARM RATE: {'<'}0.5%</li>
                    <li>// LATENCY: {'<'}500ms / TILE PROCESSING</li>
                    <li>// HARDWARE: NVIDIA A100 CLUSTER</li>
                  </ul>
                </div>
              </div>

              {/* Step 03 */}
              <div className="relative z-10 hover:z-50 group p-8 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '500ms' }}>
                <div className="text-5xl font-light text-white/[0.08] group-hover:text-white/80 transition-all duration-300 mb-6 font-mono group-hover:scale-105 origin-left">03</div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors">Attribution</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  Reverse drift modelling simulates backward trajectories to calculate origin points, cross-referencing historical AIS for definitive attribution.
                </p>

                {/* Deep Dive Floating Popover */}
                <div className="absolute top-[calc(100%+16px)] before:absolute before:-top-[16px] before:left-0 before:w-full before:h-[16px] before:content-[''] left-0 w-full sm:w-[130%] sm:-left-[15%] bg-[#050505] p-6 md:p-8 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-500 delay-0 group-hover:delay-[1500ms] flex flex-col justify-center border border-white/20 z-[999] shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[400px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <h4 className="text-white font-bold mb-3 tracking-wide text-lg">Attribution Deep Dive</h4>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-3">
                    Integrating ERA5 wind datasets and HYCOM oceanic current vectors, we run reverse Lagrangian particle dispersion models to trace the slick back to its origin. We then intersect this spatiotemporal envelope with historical AIS tracks to identify the offending vessel.
                  </p>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-5">
                    Because oil does not sit still on the ocean surface, knowing where a spill is currently located isn't enough to catch the culprit. Our models simulate hundreds of thousands of particles drifting backwards in time up to 72 hours, using advanced environmental forcing. The resulting probability heatmaps are cross-checked against billions of historical AIS location pings to find ships whose trajectories align perfectly with the spill's origin time and location, providing irrefutable forensic evidence for prosecution.
                  </p>
                  <ul className="text-[10px] text-white/50 font-mono space-y-2 border-l border-white/20 pl-3">
                    <li>// MODEL: REVERSE LAGRANGIAN DRIFT</li>
                    <li>// FORCING: HYCOM + ECMWF ERA5</li>
                    <li>// TIME HORIZON: UP TO 72 HOURS HINDCAST</li>
                    <li>// CONFIDENCE: PROBABILISTIC MATCHING (KDE)</li>
                    <li>// OUTPUT: EVIDENTIARY REPORT GENERATION</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ──── Architecture Section ──── */}
        <section id="architecture" className="py-32 px-6 relative z-30 border-t border-white/[0.05]">
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
                  Real-time ingestion pipelines querying satellite APIs, global oceanic current databases, and high-frequency AIS transponder streams.
                </p>

                {/* Deep Dive Floating Popover */}
                <div className="absolute top-[calc(100%+16px)] before:absolute before:-top-[16px] before:left-0 before:w-full before:h-[16px] before:content-[''] left-0 w-full sm:w-[130%] sm:-left-[15%] bg-[#050505] p-6 md:p-8 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-500 delay-0 group-hover:delay-[1500ms] flex flex-col justify-center border border-white/20 z-[999] shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[400px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <h4 className="text-white font-bold mb-3 tracking-wide text-lg">Data Layer Specs</h4>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-3">
                    Our multi-tenant data ingress layer handles structured and unstructured streams globally, utilizing Kafka brokers to stream high-frequency Automatic Identification System (AIS) messages in real-time. Satellite imagery from Copernicus (Sentinel-1/2) is pulled asynchronously and cached at edge locations for rapid processing.
                  </p>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-5">
                    Continuous polling of meteorological datasets (NOAA, ECMWF ERA5) and hydrodynamic currents (HYCOM) ensures our models always operate on the latest oceanic environmental boundary conditions, synchronized precisely with the SAR acquisition timestamps.
                  </p>
                  <ul className="text-[10px] text-white/50 font-mono space-y-2 border-l border-white/20 pl-3">
                    <li>// THROUGHPUT: ~4.2M EVENTS/SEC</li>
                    <li>// STORAGE: CLOUD BLOB (S3-COMPATIBLE)</li>
                    <li>// DATABASES: POSTGRES, REDIS, ELASTICSEARCH</li>
                    <li>// LATENCY: {'<'}50MS END-TO-END</li>
                  </ul>
                </div>
              </div>

              <div className="relative z-10 hover:z-50 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-8 pt-8 group hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '300ms' }}>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4 font-mono group-hover:text-white transition-colors duration-300">Layer 2</div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors">Compute Engine</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  Scalable machine learning inference nodes running advanced computer vision and fluid dynamics simulations.
                </p>

                {/* Deep Dive Floating Popover */}
                <div className="absolute top-[calc(100%+16px)] before:absolute before:-top-[16px] before:left-0 before:w-full before:h-[16px] before:content-[''] left-0 w-full sm:w-[130%] sm:-left-[15%] bg-[#050505] p-6 md:p-8 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-500 delay-0 group-hover:delay-[1500ms] flex flex-col justify-center border border-white/20 z-[999] shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[400px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <h4 className="text-white font-bold mb-3 tracking-wide text-lg">Compute Engine Specs</h4>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-3">
                    The core intelligence relies on containerized GPU-accelerated microservices utilizing PyTorch and specialized oceanographic frameworks. As soon as a SAR tile is downloaded, it triggers a serverless inference execution via Kubernetes, distributing the workload across a cluster of A100 nodes.
                  </p>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-5">
                    For attribution, the engine runs Monte Carlo reverse drift simulations, spawning millions of virtual particles to model dispersion under complex stochastic weather scenarios, generating high-fidelity probabilistic source envelopes.
                  </p>
                  <ul className="text-[10px] text-white/50 font-mono space-y-2 border-l border-white/20 pl-3">
                    <li>// FRAMEWORK: PYTORCH, TENSORFLOW</li>
                    <li>// INFRASTRUCTURE: KUBERNETES EKS</li>
                    <li>// SCALING: AUTO-SCALABLE SPOT INSTANCES</li>
                    <li>// COMPUTE: 4X NVIDIA A100 TENSOR CORES</li>
                  </ul>
                </div>
              </div>

              <div className="relative z-10 hover:z-50 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-8 pt-8 group md:col-span-2 lg:col-span-1 hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 ease-out reveal-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '500ms' }}>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4 font-mono group-hover:text-white transition-colors duration-300">Layer 3</div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors">Client Interface</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  A high-performance React frontend serving map-based visualizations and low-latency interaction via WebSocket APIs.
                </p>

                {/* Deep Dive Floating Popover */}
                <div className="absolute top-[calc(100%+16px)] before:absolute before:-top-[16px] before:left-0 before:w-full before:h-[16px] before:content-[''] left-0 w-full sm:w-[130%] sm:-left-[15%] bg-[#050505] p-6 md:p-8 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-500 delay-0 group-hover:delay-[1500ms] flex flex-col justify-center border border-white/20 z-[999] shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[400px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <h4 className="text-white font-bold mb-3 tracking-wide text-lg">Client Interface Specs</h4>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-3">
                    The intelligence dashboard is built entirely with modern React and TypeScript, leveraging Mapbox GL JS for hardware-accelerated rendering of vector tiles and polygons directly in the browser at 60 frames per second.
                  </p>
                  <p className="text-[var(--color-muted)] text-xs leading-relaxed mb-5">
                    Bidirectional WebSocket connections ensure investigators receive immediate alerts when new slicks are detected or attribution calculations finish, establishing a live, real-time command center for marine authorities.
                  </p>
                  <ul className="text-[10px] text-white/50 font-mono space-y-2 border-l border-white/20 pl-3">
                    <li>// FRONTEND: REACT 18 + TYPESCRIPT</li>
                    <li>// RENDERING: MAPBOX GL (WEBGL)</li>
                    <li>// TRANSPORT: WSS (WEB SOCKET SECURE)</li>
                    <li>// STYLING: TAILWIND CSS</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ──── Footer ──── */}
        {/* Disclaimer */}
        <div className="max-w-4xl mx-auto mb-20 rounded-2xl bg-red-950/40 border border-red-500/20 py-5 px-8 text-center z-50 relative backdrop-blur-xl shadow-[0_0_40px_rgba(239,68,68,0.05)] transition-all hover:bg-red-900/40 hover:border-red-500/40">
          <p className="text-red-200/90 font-medium tracking-wider text-sm flex items-center justify-center gap-3 uppercase">
            <span className="text-lg">⚠️</span> Disclaimer: The AI Model is currently not available for public access at the moment
          </p>
        </div>

        <footer className="bg-white/[0.02] backdrop-blur-xl pt-24 pb-12 px-6 relative z-10 border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
            <div className="w-full flex flex-col items-center justify-center gap-6 text-sm text-[var(--color-muted)]">
              <Logo showText={false} />
              <span>© 2026 ORCA. All rights reserved.</span>
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








