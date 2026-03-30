'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import RouteList from './RouteList'
import InfoCards from './InfoCards'

const RouteMap = dynamic(() => import('./RouteMap'), { ssr: false })
const ShipRouteMap = dynamic(() => import('./ShipRouteMap'), { ssr: false })

interface Route {
  id: string
  origin: any
  destination: any
  originalRoute: any
  bestRoute: any
  reasons: any
  weatherData: any
  newsData: any
  type: 'ships' | 'roads'
}

export default function RoutesClient({
  ships,
  roads,
}: {
  ships: any[]
  roads: any[]
}) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)

  const shipRoutes = ships.map(s => ({ ...s, type: 'ships' as const }))
  const roadRoutes = roads.map(r => ({ ...r, type: 'roads' as const }))

  return (
    <div className="flex h-[calc(100vh-56px)]">

      {/* Left panel - route list */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Active Routes</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Click a route to view on map
          </p>
        </div>
        <RouteList
          ships={shipRoutes}
          roads={roadRoutes}
          selectedId={selectedRoute?.id ?? null}
          onSelect={(route) => setSelectedRoute(route as Route)}
        />
      </div>

      {/* Right panel - map + info */}
      <div className="flex-1 flex flex-col">

        {/* Map area */}
        <div className="flex-1">
          {!selectedRoute ? (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Select a route from the left</p>
                <p className="text-gray-300 text-xs mt-1">
                  to view it on the map
                </p>
              </div>
            </div>
          ) : selectedRoute.type === 'ships' ? (
            <ShipRouteMap
              originalRoute={selectedRoute.originalRoute?.waypoints || []}
              bestRoute={selectedRoute.bestRoute?.waypoints || []}
              reasons={selectedRoute.reasons || []}
            />
          ) : (
            <RouteMap
              originalRoute={selectedRoute.originalRoute?.waypoints || []}
              bestRoute={selectedRoute.bestRoute?.waypoints || []}
              reasons={selectedRoute.reasons || []}
            />
          )}
        </div>

        {/* Info cards at bottom */}
        {selectedRoute && (
          <div className="border-t border-gray-200 bg-white">
            <InfoCards
              reasons={selectedRoute.reasons || []}
              weatherData={selectedRoute.weatherData}
              newsData={selectedRoute.newsData}
              originalRoute={selectedRoute.originalRoute}
              bestRoute={selectedRoute.bestRoute}
            />
          </div>
        )}

      </div>
    </div>
  )
}