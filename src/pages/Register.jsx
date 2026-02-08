import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'

const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s?.trim() || '')
const MIN_PASSWORD = 6
const MAX_EMAIL_LEN = 100

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

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const first = firstName.trim()
    const last = lastName.trim()
    const em = email.trim()

    if (!first) {
      setError('First name is required')
      return
    }
    if (!last) {
      setError('Last name is required')
      return
    }
    if (!em) {
      setError('Email is required')
      return
    }
    if (!isValidEmail(em)) {
      setError('Enter a valid email address')
      return
    }
    if (em.length > MAX_EMAIL_LEN) {
      setError(`Email must be ${MAX_EMAIL_LEN} characters or less`)
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters`)
      return
    }

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm space-y-5">
        <h1 className="text-xl font-semibold text-center">Create account</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first">First name</Label>
              <Input
                id="first"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 h-10"
                autoComplete="given-name"
              />
            </div>
            <div>
              <Label htmlFor="last">Last name</Label>
              <Input
                id="last"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 h-10"
                autoComplete="family-name"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-10"
              autoComplete="email"
              maxLength={MAX_EMAIL_LEN}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 pr-10"
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full h-10">
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>

        <div className="relative">
          <span className="absolute inset-0 flex items-center"><span className="w-full border-t" /></span>
          <span className="relative flex justify-center text-xs text-muted-foreground bg-background px-2">Or</span>
        </div>

        <Button variant="outline" className="w-full h-10" onClick={onGoogle} disabled={loading}>
          Continue with Google
        </Button>
      </div>
    </div>
  )
}
