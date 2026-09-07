import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const resp = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data.error || 'Invalid email or password')
      }

      localStorage.setItem('token', data.token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-void)] flex items-center justify-center p-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[var(--color-signal-amber)] opacity-[0.03] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-signal-amber)] bg-opacity-20 flex items-center justify-center">
            <span className="text-[var(--color-signal-amber)] text-lg font-bold">OW</span>
          </div>
          <div>
            <h1 className="text-[var(--color-text-white)] font-semibold text-lg tracking-tight">OilWatch AI</h1>
            <p className="text-label-sm text-[var(--color-muted)]">MARITIME INTELLIGENCE</p>
          </div>
        </div>

        {/* Login card */}
        <div className="glass-level-2 rounded-2xl p-8">
          <h2 className="text-headline-md text-[var(--color-text-white)] mb-2">Sign in</h2>
          <p className="text-body-md text-[var(--color-muted-light)] mb-8">
            Access your maritime intelligence dashboard
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30">
              <p className="text-body-sm text-[var(--color-error)]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="text-label-md text-[var(--color-muted-light)] mb-2 block">
                EMAIL
              </label>
              <div className="glass-level-1 rounded-lg px-4 py-0.5">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@oilwatch.ai"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="text-label-md text-[var(--color-muted-light)] mb-2 block">
                PASSWORD
              </label>
              <div className="glass-level-1 rounded-lg px-4 py-0.5">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-4"
            >
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>

          <p className="text-body-sm text-[var(--color-muted)] text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--color-signal-amber)] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
