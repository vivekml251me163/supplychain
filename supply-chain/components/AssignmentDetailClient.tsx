'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AssignmentDetailMap from '@/components/AssignmentDetailMap'

interface AssignmentDetailClientProps {
  assignment: any
  driverName: string
  routeDetails: {
    srcLat: number
    srcLon: number
    destLat: number
    destLon: number
    goodsAmount: number
  }
}

export default function AssignmentDetailClient({
  assignment,
  driverName,
  routeDetails,
}: AssignmentDetailClientProps) {
  const router = useRouter()
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCompleteAssignment = async () => {
    setIsCompleting(true)
    setError(null)

    try {
      const response = await fetch('/api/assignment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: assignment.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to complete assignment')
      }

      // Redirect back to manager dashboard after successful completion
      router.push('/manager/road')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsCompleting(false)
    }
  }

  const reasons = assignment.bestRoute?.reasons || {}
  const routePoints = assignment.bestRoute?.route || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Assignment Details</h1>
          <p className="text-gray-600 mt-2">Optimized route information and delivery details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Optimized Route</h2>
              </div>
              <AssignmentDetailMap bestRoute={routePoints} reasons={reasons} />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Driver</p>
                  <p className="text-lg font-semibold text-gray-900">{driverName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity Assigned</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {assignment.assignedQuantity.toFixed(2)} units
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <p
                    className={`text-lg font-semibold ${
                      assignment.workDone ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {assignment.workDone ? '✓ Completed' : '⏳ In Progress'}
                  </p>
                </div>
                {assignment.completedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Completed At</p>
                    <p className="text-gray-900">
                      {new Date(assignment.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Route Details Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Pickup Location</p>
                  <p className="text-gray-900 text-sm">
                    {routeDetails.srcLat.toFixed(4)}, {routeDetails.srcLon.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Location</p>
                  <p className="text-gray-900 text-sm">
                    {routeDetails.destLat.toFixed(4)}, {routeDetails.destLon.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Goods</p>
                  <p className="text-gray-900 font-semibold">
                    {routeDetails.goodsAmount.toFixed(2)} units
                  </p>
                </div>
              </div>
            </div>

            {/* Complete Button */}
            {!assignment.workDone && (
              <div className="bg-white rounded-lg shadow-md p-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
                <button
                  onClick={handleCompleteAssignment}
                  disabled={isCompleting}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                >
                  {isCompleting ? 'Completing...' : 'Mark as Complete'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reasons Section */}
        {Object.keys(reasons).length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Optimization Reasons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(reasons).map(([key, value]: [string, any]) => (
                <div key={key} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 capitalize mb-2">
                    {key.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
