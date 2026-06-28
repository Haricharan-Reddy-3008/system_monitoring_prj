import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        navigate('/projects')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        // Give friendly error messages for common Supabase errors
        if (error.message.includes('rate limit')) {
          throw new Error('Too many signup attempts. Please wait a few minutes and try again, or use an existing account.')
        }
        if (error.message.includes('invalid')) {
          throw new Error('Please use a real email address (e.g. yourname@gmail.com). Test domains like @example.com are not allowed.')
        }
        throw error
      }

      // If user is already confirmed (email confirmation disabled in Supabase),
      // log them in and go straight to the dashboard
      if (data.user && data.user.confirmed_at) {
        navigate('/projects')
        return
      }

      // If email confirmation is required, show clear instructions
      setError('✅ Account created! Check your email inbox for a confirmation link. Click it, then come back and Sign In.')
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="card max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          System Monitoring Platform
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Real-time monitoring with AI predictions
        </p>

        {error && (
          <div className={`p-4 rounded-lg mb-4 ${
            error.includes('Check your email') 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign Up
            </button>
          </div>
        </form>

        <p className="text-slate-500 text-sm text-center mt-6">
          Demo credentials will be provided after setup
        </p>

        <div className="mt-5 flex justify-center gap-4 text-sm">
          <Link to="/about" className="text-slate-400 hover:text-white">
            About
          </Link>
          <Link to="/how-to-use" className="text-slate-400 hover:text-white">
            How to Use
          </Link>
        </div>
      </div>
    </div>
  )
}
