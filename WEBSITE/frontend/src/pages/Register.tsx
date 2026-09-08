import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const resp = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      localStorage.setItem('token', data.token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-void)] flex items-center justify-center p-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[var(--color-signal-amber)] opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[200px] rounded-full bg-[var(--color-electric-cyan)] opacity-[0.02] blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Logo />

        {/* Register card */}
        <div className="glass-level-2 rounded-2xl p-8">
          <h2 className="text-headline-md text-[var(--color-text-white)] mb-2">Create Account</h2>
          <p className="text-body-md text-[var(--color-muted-light)] mb-8">
            Register to access the maritime intelligence platform
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30">
              <p className="text-body-sm text-[var(--color-error)]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="register-email" className="text-label-md text-[var(--color-muted-light)] mb-2 block">
                EMAIL
              </label>
              <div className="glass-level-1 rounded-lg px-4 py-0.5">
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@orca.ai"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-password" className="text-label-md text-[var(--color-muted-light)] mb-2 block">
                PASSWORD
              </label>
              <div className="glass-level-1 rounded-lg px-4 py-0.5">
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-confirm" className="text-label-md text-[var(--color-muted-light)] mb-2 block">
                CONFIRM PASSWORD
              </label>
              <div className="glass-level-1 rounded-lg px-4 py-0.5">
                <input
                  id="register-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-body-sm text-[var(--color-muted)] text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-signal-amber)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
