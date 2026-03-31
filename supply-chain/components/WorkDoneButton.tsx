'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WorkDoneButton({
  assignmentId,
  workDone,
  destLat,
  destLon,
}: {
  assignmentId: string
  workDone: boolean
  destLat?: number
  destLon?: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(workDone)
  const [showConfirmation, setShowConfirmation] = useState(false)

  async function handleToggle() {
    if (!done && !showConfirmation) {
      setShowConfirmation(true)
      return
    }

    setLoading(true)
    await fetch('/api/driver/workdone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId, workDone: !done }),
    })
    setDone(!done)
    setShowConfirmation(false)
    setLoading(false)
    router.refresh()
  }

  if (showConfirmation) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-700 font-medium">
          Confirm completion? Your location will be updated to the delivery destination:
        </p>
        {(destLat !== undefined && destLon !== undefined) && (
          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            📍 {destLat.toFixed(4)}, {destLon.toFixed(4)}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleToggle}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Confirming...' : '✓ Confirm Completion'}
          </button>
          <button
            onClick={() => setShowConfirmation(false)}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-sm px-4 py-2 rounded-lg border transition font-medium ${
        done
          ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
          : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
      }`}
    >
      {loading ? '...' : done ? '✓ Work Done' : 'Mark Delivery as Complete'}
    </button>
  )
}