'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Button from '@/components/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      // Let middleware handle the redirect based on role
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = '/'
    }
  }

  // Handle Enter key on form inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1 poppins-bold">Sign in</h1>
        <p className="text-gray-500 text-sm mb-6 poppins-regular">Supply Chain Management</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4 poppins-regular">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-600 text-sm p-3 rounded-lg mb-4 poppins-regular">
            Signing in...
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block poppins-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 poppins-regular"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block poppins-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 poppins-regular"
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            variant="default"
            fullWidth
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <p className="text-center text-sm text-gray-500 poppins-regular">
            Don't have an account?{' '}
            <a href="/register" className="text-emerald-600 hover:underline poppins-medium">Register</a>
          </p>
        </div>
      </div>
    </div>
  )
}