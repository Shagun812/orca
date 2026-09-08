import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import PixelSnow from '../components/PixelSnow';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const resp = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-void)] flex flex-col relative overflow-hidden selection:bg-[var(--color-signal-amber)] selection:text-black">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <PixelSnow 
          color="#ffffff"
          flakeSize={0.01}
          minFlakeSize={1.25}
          pixelResolution={200}
          speed={1.25}
          density={0.2}
          direction={125}
          brightness={0.8}
          depthFade={8}
          farPlane={20}
          gamma={0.4545}
          variant="square"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-[100%] bg-[var(--color-signal-amber)]/[0.04] blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-electric-cyan)]/[0.03] blur-[100px] animate-float" />
        
        {/* subtle grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-8 py-6 flex items-center justify-between animate-fade-in">
        <Logo />
        <Link to="/" className="text-sm font-medium text-[var(--color-muted)] hover:text-white transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Overview
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="w-full max-w-[420px]">
          {/* Login card */}
          <div className="bg-[#141417]/80 backdrop-blur-3xl rounded-[2rem] p-10 border border-white/[0.05] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">Welcome Back</h2>
              <p className="text-[var(--color-muted)] text-sm">
                Authenticate to access intelligence dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/30 flex items-start gap-3 animate-slide-right">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-xs font-semibold tracking-wider text-[var(--color-muted)] uppercase ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-[var(--color-muted)] group-focus-within:text-[var(--color-signal-amber)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@orca.ai"
                    className="w-full bg-black/40 border border-white/[0.06] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-signal-amber)]/50 focus:bg-black/60 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="text-xs font-semibold tracking-wider text-[var(--color-muted)] uppercase ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-[var(--color-muted)] group-focus-within:text-[var(--color-signal-amber)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/[0.06] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-signal-amber)]/50 focus:bg-black/60 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[var(--color-signal-amber)] hover:bg-amber-400 text-black font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  'Secure Login'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
              <p className="text-xs text-[var(--color-muted)]">
                Unauthorized access is strictly prohibited.<br />
                Monitored by ORCA Systems.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
