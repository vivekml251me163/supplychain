'use client'

import { useState, useEffect } from 'react'
import ShipManagerForm from '@/components/ShipManagerForm'
import ShipRouteMapClient from '@/components/ShipRouteMapClient'

interface ShipReroute {
  id: number
  userId: string
  shipId: number
  affectedByNews: any
  affectedByWeather: any
  suggestion: string
  bestRoute: any
  createdAt: string
}

export default function ShipManagerClient() {
  const [selectedReroute, setSelectedReroute] = useState<ShipReroute | null>(null)

  useEffect(() => {
    // Load from localStorage if available
    const savedShipId = localStorage.getItem('selectedShipId')
    const savedReroute = localStorage.getItem('selectedReroute')
    
    if (savedReroute) {
      try {
        setSelectedReroute(JSON.parse(savedReroute))
      } catch (e) {
        console.error('Failed to parse saved reroute', e)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Ship Selector */}
      <ShipManagerForm onRerouteSelect={(reroute) => setSelectedReroute(reroute)} />

      {/* Stats Cards */}
      {selectedReroute && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Ship ID</p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedReroute.shipId}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Route ID</p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedReroute.id}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Created At</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(selectedReroute.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Route Map */}
      {selectedReroute && selectedReroute.bestRoute && (
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
              originalRoute={selectedReroute.bestRoute}
              bestRoute={selectedReroute.bestRoute}
              reasons={selectedReroute.suggestion ? [selectedReroute.suggestion] : []}
            />
          </div>
        </div>
      )}

      {/* Suggestions */}
      {selectedReroute && selectedReroute.suggestion && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Route Suggestion</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {selectedReroute.suggestion}
          </p>
        </div>
      )}

      {/* Affected by News */}
      {selectedReroute && selectedReroute.affectedByNews && selectedReroute.affectedByNews.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Affected by News</h3>
          <div className="space-y-2">
            {selectedReroute.affectedByNews.map((news: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-blue-900"
              >
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>{news.title || news.description || JSON.stringify(news)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Affected by Weather */}
      {selectedReroute && selectedReroute.affectedByWeather && selectedReroute.affectedByWeather.length > 0 && (
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <h3 className="font-semibold text-orange-900 mb-3">Affected by Weather</h3>
          <div className="space-y-2">
            {selectedReroute.affectedByWeather.map((weather: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-orange-900"
              >
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>{weather.condition || weather.description || JSON.stringify(weather)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
