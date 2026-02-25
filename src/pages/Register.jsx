import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Compass, User, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'

const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s?.trim() || '')
const MIN_PASSWORD = 6
const MAX_EMAIL_LEN = 100
const PREF_TAGS = ['Food', 'Nature', 'History', 'Adventure', 'Luxury']

export default function Register() {
  const navigate = useNavigate()
  const { register, loginWithGoogle } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPrefs, setSelectedPrefs] = useState([])

  const togglePref = (pref) =>
    setSelectedPrefs((p) => p.includes(pref) ? p.filter((x) => x !== pref) : [...p, pref])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const first = firstName.trim()
    const last = lastName.trim()
    const em = email.trim()
    if (!first) { setError('First name is required'); return }
    if (!last) { setError('Last name is required'); return }
    if (!em) { setError('Email is required'); return }
    if (!isValidEmail(em)) { setError('Enter a valid email address'); return }
    if (em.length > MAX_EMAIL_LEN) { setError(`Email must be ${MAX_EMAIL_LEN} characters or less`); return }
    if (!password) { setError('Password is required'); return }
    if (password.length < MIN_PASSWORD) { setError(`Password must be at least ${MIN_PASSWORD} characters`); return }
    setLoading(true)
    try {
      await register({ first_name: first, last_name: last, email: em, password })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  async function onGoogle() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal nav */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Compass className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Voyager AI</span>
        </Link>
        <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          Need help?
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — form panel */}
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Start Your Journey</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Create an account to get personalized travel planning powered by intelligence.
              </p>
            </div>

            {/* Google first */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl border border-border bg-card hover:bg-muted mb-6 gap-2"
              onClick={onGoogle}
              disabled={loading}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs uppercase tracking-widest text-muted-foreground">or via email</span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullname" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <Input
                    id="fullname"
                    placeholder="Enter your full name"
                    value={[firstName, lastName].filter(Boolean).join(' ')}
                    onChange={(e) => {
                      const parts = e.target.value.split(' ')
                      setFirstName(parts[0] || '')
                      setLastName(parts.slice(1).join(' ') || '')
                    }}
                    className="h-12 rounded-xl border border-border bg-input pr-12 focus:border-primary transition-colors"
                    autoComplete="name"
                  />
                  <User className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border border-border bg-input pr-12 focus:border-primary transition-colors"
                    autoComplete="email"
                    maxLength={MAX_EMAIL_LEN}
                  />
                  <Mail className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border border-border bg-input pr-12 focus:border-primary transition-colors"
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Travel preference tags */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Travel Preference Tags{' '}
                  <span className="normal-case font-normal text-muted-foreground/60">(Optional)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PREF_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => togglePref(tag)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${selectedPrefs.includes(tag)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-muted text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-sm font-semibold uppercase tracking-widest gap-2"
              >
                {loading ? 'Creating account…' : 'Create Account'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already a voyager?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </div>

        {/* Right — mountain photo (hidden on mobile) */}
        <div className="hidden lg:block lg:w-[45%] relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80"
            alt="Mountain landscape"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
        </div>
      </div>
    </div>
  )
}
