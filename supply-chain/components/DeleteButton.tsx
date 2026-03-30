'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true)
      return
    }
    setLoading(true)
    await fetch('/api/admin/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    router.refresh()
    setLoading(false)
    setConfirm(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
        confirm
          ? 'bg-red-500 text-white border-red-500'
          : 'border-red-200 text-red-500 hover:bg-red-50'
      }`}
    >
      {loading ? '...' : confirm ? 'Sure?' : 'Delete'}
    </button>
  )
}