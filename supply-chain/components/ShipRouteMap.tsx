'use client'

import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface RoutePoint {
  lat: number
  lng: number
}

interface ShipRouteMapProps {
  originalRoute: RoutePoint[]
  bestRoute: RoutePoint[]
  reasons: string[]
}

// This function adds curve points between each pair of coordinates
function interpolateRoute(points: RoutePoint[], steps: number = 10): RoutePoint[] {
  const result: RoutePoint[] = []

  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i]
    const to = points[i + 1]

    for (let t = 0; t <= steps; t++) {
      const ratio = t / steps

      // midpoint slightly offset to create natural curve
      const midLat = (from.lat + to.lat) / 2 + (to.lng - from.lng) * 0.05
      const midLng = (from.lng + to.lng) / 2 - (to.lat - from.lat) * 0.05

      // quadratic bezier curve formula
      const lat =
        (1 - ratio) * (1 - ratio) * from.lat +
        2 * (1 - ratio) * ratio * midLat +
        ratio * ratio * to.lat

      const lng =
        (1 - ratio) * (1 - ratio) * from.lng +
        2 * (1 - ratio) * ratio * midLng +
        ratio * ratio * to.lng

      result.push({ lat, lng })
    }
  }

  return result
}

export default function ShipRouteMap({ originalRoute, bestRoute, reasons }: ShipRouteMapProps) {

  // Validate route data — it may come as a JSON string, array of arrays, or array of objects
  const parseRoute = (route: any): RoutePoint[] => {
    try {
      const parsed = typeof route === 'string' ? JSON.parse(route) : route
      if (!Array.isArray(parsed) || parsed.length === 0) return []
      // Handle both formats: {lat, lng} objects and [lat, lng] arrays
      return parsed
        .map((p: any) => {
          if (Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number') {
            return { lat: p[0], lng: p[1] }
          }
          if (p && typeof p.lat === 'number' && typeof p.lng === 'number') {
            return { lat: p.lat, lng: p.lng }
          }
          return null
        })
        .filter((p: RoutePoint | null): p is RoutePoint => p !== null)
    } catch {
      return []
    }
  }

  const validOriginal = parseRoute(originalRoute)
  const validBest = parseRoute(bestRoute)

  // If no valid route data, show fallback
  if (validOriginal.length === 0 && validBest.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md p-8 text-center">
        <p className="text-gray-500 text-sm">No valid route data available to display on the map.</p>
      </div>
    )
  }

  // Apply curve interpolation
  const smoothOriginal = validOriginal.length > 1 ? interpolateRoute(validOriginal, 20) : validOriginal
  const smoothBest = validBest.length > 1 ? interpolateRoute(validBest, 20) : validBest

  const originalPositions = smoothOriginal.map(p => [p.lat, p.lng] as [number, number])
  const bestPositions = smoothBest.map(p => [p.lat, p.lng] as [number, number])

  return (
    <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md relative z-0">

      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-gray-800 text-lg font-bold">Ship Route Optimization</h2>
        <p className="text-gray-500 text-sm">Live sea route analysis based on current conditions</p>
      </div>

      {/* Map */}
      <MapContainer
        center={validOriginal.length > 0 ? [validOriginal[0].lat, validOriginal[0].lng] : validBest.length > 0 ? [validBest[0].lat, validBest[0].lng] : [10.0, 80.0]}
        zoom={4}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Original sea route - RED dashed curved */}
        <Polyline
          positions={originalPositions}
          color="#ef4444"
          weight={3}
          dashArray="10 5"
          smoothFactor={5}
        />

        {/* Best sea route - GREEN solid curved */}
        <Polyline
          positions={bestPositions}
          color="#16a34a"
          weight={3}
          smoothFactor={5}
        />

        {/* Origin port marker */}
        {validOriginal.length > 0 && (
          <Marker position={[validOriginal[0].lat, validOriginal[0].lng]}>
            <Popup>⚓ Origin Port</Popup>
          </Marker>
        )}

        {/* Destination port marker */}
        {validOriginal.length > 1 && (
          <Marker position={[validOriginal[validOriginal.length - 1].lat, validOriginal[validOriginal.length - 1].lng]}>
            <Popup>🏁 Destination Port</Popup>
          </Marker>
        )}

      </MapContainer>

      {/* Legend */}
      <div className="flex gap-6 px-4 py-3 border-t border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8" style={{ borderTop: '3px dashed #ef4444' }}></div>
          <span className="text-red-500 text-sm">Original Route</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8" style={{ borderTop: '3px solid #16a34a' }}></div>
          <span className="text-green-600 text-sm">Optimised Route</span>
        </div>
      </div>

      {/* Reasons panel */}
      <div className="p-4 bg-white">
        <h3 className="text-gray-800 font-bold mb-3">Why Route Changed</h3>
        <div className="flex flex-col gap-2">
          {reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <span className="text-yellow-600 mt-0.5">•</span>
              <p className="text-yellow-700 text-sm">{reason}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}