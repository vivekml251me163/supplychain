'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'driver',
    capacity: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
    } else {
      router.push('/login')
    }
    setLoading(false)
  }

  // Handle Enter key on form inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleRegister()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1 poppins-bold">Register</h1>
        <p className="text-gray-500 text-sm mb-6 poppins-regular">Create your account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4 poppins-regular">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block poppins-medium">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder="John Doe"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 poppins-regular"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block poppins-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 poppins-regular"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block poppins-medium">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 poppins-regular"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block poppins-medium">Role</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              onKeyPress={handleKeyPress}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 poppins-regular"
            >
              <option value="driver">Driver</option>
              <option value="manager">Manager</option>
              <option value="manager_ship">Manager Ship</option>
            </select>
          </div>

          {form.role === 'driver' && (
            <div>
              <label className="text-sm text-gray-600 mb-1 block poppins-medium">Truck Capacity (units)</label>
              <input
                type="number"
                step="0.1"
                value={form.capacity}
                onChange={e => setForm({ ...form, capacity: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 1000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 poppins-regular"
              />
            </div>
          )}

          <Button
            onClick={handleRegister}
            disabled={loading}
            variant="default"
            fullWidth
          >
            {loading ? 'Creating account...' : 'Register'}
          </Button>

          <p className="text-center text-sm text-gray-500 poppins-regular">
            Already have an account?{' '}
            <a href="/login" className="text-emerald-600 hover:underline poppins-medium">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}