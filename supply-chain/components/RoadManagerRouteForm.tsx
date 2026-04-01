'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RoadManagerRouteForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    srcLat: '',
    srcLon: '',
    destLat: '',
    destLon: '',
    goodsAmount: '',
  })

  async function handleCreateRoute() {
    setLoading(true)
    setError('')
    setSuccess(false)

    // Basic required validation
    if (!form.srcLat || !form.srcLon || !form.destLat || !form.destLon || !form.goodsAmount) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    const srcLat = parseFloat(form.srcLat)
    const srcLon = parseFloat(form.srcLon)
    const destLat = parseFloat(form.destLat)
    const destLon = parseFloat(form.destLon)
    const goodsAmount = parseFloat(form.goodsAmount)

    // Number validation
    if (isNaN(srcLat) || isNaN(srcLon) || isNaN(destLat) || isNaN(destLon) || isNaN(goodsAmount)) {
      setError('Please enter valid numbers for coordinates and goods amount')
      setLoading(false)
      return
    }

    // Range/Logic validation
    if (goodsAmount <= 0) {
      setError('Goods amount must be greater than 0')
      setLoading(false)
      return
    }

    try {
      // 1. Create the route in the database
      const res = await fetch('/api/manager/roads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          srcLat,
          srcLon,
          destLat,
          destLon,
          goodsAmount,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create route in database')
        setLoading(false)
        return
      }

      // 2. Attempt ML Assignment via proxy endpoint
      let mlSuccess = false
      try {
        const resk = await fetch('/api/ml/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routeId: data.route.id,
          }),
        })

        const data2 = await resk.json()

        if (!resk.ok) {
          // If ML fails but DB succeeded, we show a partial success/warning
          console.error('ML Assignment failed:', data2)
          setError(`Route created successfully! Assignment service response: ${data2.error || 'Service unavailable'}. Drivers will be assigned in the next cycle.`)
        } else {
          // ML assignment succeeded
          mlSuccess = true
          setSuccess(true)
          console.log('ML Assignment successful:', data2)
        }
      } catch (mlErr) {
        // ML service might be down, but the route is still in the DB
        console.error('ML Assignment Service Error:', mlErr)
        setError('Route created successfully! The automated assignment service is currently unavailable. Drivers will be assigned manually or during the next cycle.')
      }

      // Clear form on successful DB creation regardless of ML status (since route exists now)
      setForm({
        srcLat: '',
        srcLon: '',
        destLat: '',
        destLon: '',
        goodsAmount: '',
      })
      
      // If ML succeeded, show success message; otherwise show it was created even if assignment failed
      if (!mlSuccess && !success) {
        setSuccess(true) // Show success because route was created in DB
      }
      
      // Refresh the page after delay
      setTimeout(() => {
        router.refresh()
      }, 2000)

    } catch (err) {
      setError('An unexpected error occurred. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 text-sm p-4 rounded-lg mb-4">
          ✓ Route created successfully! The ML system will assign a driver shortly.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pickup Location */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pickup Location</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={form.srcLat}
                onChange={(e) => setForm({ ...form, srcLat: e.target.value })}
                placeholder="e.g., 40.7128"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={form.srcLon}
                onChange={(e) => setForm({ ...form, srcLon: e.target.value })}
                placeholder="e.g., -74.0060"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Delivery Location */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Location</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={form.destLat}
                onChange={(e) => setForm({ ...form, destLat: e.target.value })}
                placeholder="e.g., 34.0522"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={form.destLon}
                onChange={(e) => setForm({ ...form, destLon: e.target.value })}
                placeholder="e.g., -118.2437"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Goods Amount */}
      <div className="mb-6">
        <label className="text-sm text-gray-600 block mb-2">Goods Amount (units)</label>
        <input
          type="number"
          step="0.1"
          value={form.goodsAmount}
          onChange={(e) => setForm({ ...form, goodsAmount: e.target.value })}
          placeholder="e.g., 500"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleCreateRoute}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Creating Route...' : '➕ Create Route'}
      </button>

      <p className="text-xs text-gray-500 mt-4">
        After creating a route, the ML system will analyze available drivers and create assignments. You'll see pending routes here until they're assigned.
      </p>
    </div>
  )
}
