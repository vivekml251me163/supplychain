'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyButton({
  userId,
  isVerified,
}: {
  userId: string
  isVerified: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleVerify() {
    setLoading(true)
    await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isVerified: !isVerified }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
        isVerified
          ? 'border-red-200 text-red-500 hover:bg-red-50'
          : 'border-green-200 text-green-600 hover:bg-green-50'
      }`}
    >
      {loading ? '...' : isVerified ? 'Revoke' : 'Verify'}
    </button>
  )
}