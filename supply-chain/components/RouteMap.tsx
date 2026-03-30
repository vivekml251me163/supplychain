'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface RoutePoint {
  lat: number
  lng: number
}

interface RouteMapProps {
  originalRoute: RoutePoint[]
  bestRoute: RoutePoint[]
  reasons: string[]
}

async function getRoadRoute(points: RoutePoint[]): Promise<RoutePoint[]> {
  if (!points || points.length < 2) return points
  
  // Convert points to OSRM format: lng,lat;lng,lat
  const coords = points.map(p => `${p.lng},${p.lat}`).join(';')
  
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`,
      { signal: AbortSignal.timeout(5000) }
    )
    const data = await res.json()
    
    if (!data.routes || !data.routes[0]) return points
    
    // Extract road coordinates from response
    const roadCoords = data.routes[0].geometry.coordinates
    return roadCoords.map(([lng, lat]: [number, number]) => ({ lat, lng }))
  } catch (err) {
    console.error('OSRM error, using direct route:', err)
    return points // Fallback to direct route
  }
}

function MapFitter({ originalRoad, bestRoad, originalRoute, bestRoute }: any) {
  const map = useMap()
  
  useEffect(() => {
    const allPoints = [...(originalRoad || originalRoute || []), ...(bestRoad || bestRoute || [])]
    
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(
        allPoints.map(p => [p.lat, p.lng] as [number, number])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [originalRoad, bestRoad, originalRoute, bestRoute, map])
  
  return null
}

export default function RouteMap({ originalRoute, bestRoute, reasons }: RouteMapProps) {
  const [originalRoad, setOriginalRoad] = useState<RoutePoint[]>([])
  const [bestRoad, setBestRoad] = useState<RoutePoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRoutes() {
      if (!originalRoute?.length || !bestRoute?.length) {
        setLoading(false)
        return
      }
      
      try {
        const [orig, best] = await Promise.all([
          getRoadRoute(originalRoute),
          getRoadRoute(bestRoute)
        ])
        setOriginalRoad(orig || originalRoute)
        setBestRoad(best || bestRoute)
      } catch (err) {
        console.error('Route loading error:', err)
        setOriginalRoad(originalRoute)
        setBestRoad(bestRoute)
      } finally {
        setLoading(false)
      }
    }
    loadRoutes()
  }, [originalRoute, bestRoute])

  const displayOriginal = originalRoad.length > 0 ? originalRoad : originalRoute
  const displayBest = bestRoad.length > 0 ? bestRoad : bestRoute
  
  const originalPositions = displayOriginal.map(p => [p.lat, p.lng] as [number, number])
  const bestPositions = displayBest.map(p => [p.lat, p.lng] as [number, number])

  return (
    <div className="w-full rounded-xl overflow-hidden">

      {loading && (
        <div className="w-full h-[500px] flex items-center justify-center bg-gray-800 text-white">
          Loading road routes...
        </div>
      )}

      {!loading && (
        <MapContainer
          center={[20, 78]}
          zoom={5}
          className="w-full h-[500px]"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          <MapFitter originalRoad={originalRoad} bestRoad={bestRoad} originalRoute={originalRoute} bestRoute={bestRoute} />

          {/* Original route - Red */}
          {originalPositions.length > 0 && (
            <>
              <Polyline
                positions={originalPositions}
                color="#ff0000"
                weight={4}
                opacity={0.7}
              />
              <Polyline
                positions={originalPositions}
                color="#ff2222"
                weight={2}
                dashArray="5, 5"
              />
            </>
          )}

          {/* Best route - Green */}
          {bestPositions.length > 0 && (
            <>
              <Polyline
                positions={bestPositions}
                color="#00dd44"
                weight={4}
                opacity={0.9}
              />
              <Polyline
                positions={bestPositions}
                color="#00ff00"
                weight={2}
              />
            </>
          )}

          {/* Start marker */}
          {displayOriginal.length > 0 && (
            <Marker position={[displayOriginal[0].lat, displayOriginal[0].lng]}>
              <Popup>Origin</Popup>
            </Marker>
          )}

          {/* End marker */}
          {displayOriginal.length > 0 && (
            <Marker position={[displayOriginal[displayOriginal.length - 1].lat, displayOriginal[displayOriginal.length - 1].lng]}>
              <Popup>Destination</Popup>
            </Marker>
          )}

        </MapContainer>
      )}

      {/* Reasons panel */}
      <div className="mt-4 p-4 bg-gray-900 rounded-xl">
        <h3 className="text-white font-bold mb-2">⚠️ Why Route Changed</h3>
        {reasons.map((reason, i) => (
          <p key={i} className="text-yellow-400 text-sm">• {reason}</p>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex gap-6 p-3 bg-gray-900 rounded-xl">
  <div className="flex items-center gap-2">
    <div className="w-8 h-[3px] bg-[#ff2222]" style={{borderTop: '2px dashed #ff2222'}}></div>
    <span className="text-[#ff2222] text-sm">Original Route</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-8 h-[3px] bg-[#00dd44]"></div>
    <span className="text-[#00dd44] text-sm">Optimised Route</span>
  </div>
</div>

    </div>
  )
}