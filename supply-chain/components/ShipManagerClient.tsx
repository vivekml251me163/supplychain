'use client'

import { useState } from 'react'
import ShipManagerForm from '@/components/ShipManagerForm'
import ShipRouteMapClient from '@/components/ShipRouteMapClient'

interface Ship {
  id: string
  userId: string
  origin: any
  destination: any
  originalRoute: any
  bestRoute: any
  reasons: any
  weatherData: any
  newsData: any
  createdAt: string
  refreshedAt: string
}

export default function ShipManagerClient() {
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null)

  return (
    <div className="space-y-6">
      {/* Ship Selector */}
      <ShipManagerForm onShipSelect={(ship) => setSelectedShip(ship)} />

      {/* Stats Cards */}
      {selectedShip && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Ship ID</p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedShip.id.substring(0, 8)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Origin</p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedShip.origin?.name || 'Unknown'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Destination</p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedShip.destination?.name || 'Unknown'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Last Updated</p>
            <p className="text-sm font-semibold text-gray-900">
              {selectedShip.refreshedAt
                ? new Date(selectedShip.refreshedAt).toLocaleDateString()
                : new Date(selectedShip.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Route Map */}
      {selectedShip && selectedShip.bestRoute && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Optimized Route
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Green line: optimized route | Red dashed line: original route
            </p>
          </div>
          <div className="h-96">
            <ShipRouteMapClient
              originalRoute={selectedShip.originalRoute}
              bestRoute={selectedShip.bestRoute}
              reasons={selectedShip.reasons}
            />
          </div>
        </div>
      )}

      {/* Info Cards - Reasons */}
      {selectedShip && selectedShip.reasons && selectedShip.reasons.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Optimization Reasons
          </h3>
          <div className="space-y-2">
            {selectedShip.reasons.map(
              (reason: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>{reason}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Info Cards - Weather Data */}
      {selectedShip && selectedShip.weatherData && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Weather Data</h3>
          <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto text-gray-700">
            {JSON.stringify(selectedShip.weatherData, null, 2)}
          </pre>
        </div>
      )}

      {/* Info Cards - News Data */}
      {selectedShip && selectedShip.newsData && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">News Data</h3>
          <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto text-gray-700">
            {JSON.stringify(selectedShip.newsData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
