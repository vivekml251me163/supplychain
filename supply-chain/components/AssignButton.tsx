'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Route {
  id: string
  label: string
  type: 'ships' | 'roads'
}

interface Driver {
  id: string
  name: string
}

export default function AssignButton({
  drivers,
  routes,
}: {
  drivers: Driver[]
  routes: Route[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [driverId, setDriverId] = useState('')
  const [routeId, setRouteId] = useState('')
  const [routeType, setRouteType] = useState('roads')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleAssign() {
    if (!driverId || !routeId) return
    setLoading(true)
    await fetch('/api/manager/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId, routeId, routeType }),
    })
    setLoading(false)
    setSuccess(true)
    setOpen(false)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition"
      >
        + Assign Route to Driver
      </button>

      {success && (
        <span className="ml-3 text-sm text-green-600">✓ Assigned successfully!</span>
      )}

      {open && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 max-w-md">
          <h3 className="text-sm font-medium text-gray-700">New Assignment</h3>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Select Driver</label>
            <select
              value={driverId}
              onChange={e => setDriverId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="">-- choose driver --</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Route Type</label>
            <select
              value={routeType}
              onChange={e => setRouteType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="roads">Roads 🚛</option>
              <option value="ships">Ships 🚢</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Select Route</label>
            <select
              value={routeId}
              onChange={e => setRouteId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="">-- choose route --</option>
              {routes
                .filter(r => r.type === routeType)
                .map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAssign}
              disabled={loading}
              className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700"
            >
              {loading ? 'Assigning...' : 'Confirm Assign'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}