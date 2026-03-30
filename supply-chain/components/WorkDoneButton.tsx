'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WorkDoneButton({
  assignmentId,
  workDone,
}: {
  assignmentId: string
  workDone: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(workDone)

  async function handleToggle() {
    setLoading(true)
    await fetch('/api/driver/workdone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId, workDone: !done }),
    })
    setDone(!done)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs px-4 py-1.5 rounded-lg border transition ${
        done
          ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {loading ? '...' : done ? '✓ Work Done' : 'Mark as Done'}
    </button>
  )
}