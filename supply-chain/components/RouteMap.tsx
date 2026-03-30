'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
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
  // Convert points to OSRM format: lng,lat;lng,lat
  const coords = points.map(p => `${p.lng},${p.lat}`).join(';')
  
  const res = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`
  )
  const data = await res.json()
  
  // Extract road coordinates from response
  const roadCoords = data.routes[0].geometry.coordinates
  return roadCoords.map(([lng, lat]: [number, number]) => ({ lat, lng }))
}

export default function RouteMap({ originalRoute, bestRoute, reasons }: RouteMapProps) {
  const [originalRoad, setOriginalRoad] = useState<RoutePoint[]>([])
  const [bestRoad, setBestRoad] = useState<RoutePoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRoutes() {
      try {
        const [orig, best] = await Promise.all([
          getRoadRoute(originalRoute),
          getRoadRoute(bestRoute)
        ])
        setOriginalRoad(orig)
        setBestRoad(best)
      } catch (err) {
        console.error('OSRM error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadRoutes()
  }, [])

  const originalPositions = originalRoad.map(p => [p.lat, p.lng] as [number, number])
  const bestPositions = bestRoad.map(p => [p.lat, p.lng] as [number, number])

  return (
    <div className="w-full rounded-xl overflow-hidden">

      {loading && (
        <div className="w-full h-[500px] flex items-center justify-center bg-gray-800 text-white">
          Loading road routes...
        </div>
      )}

      {!loading && (
        <MapContainer
          center={[15.5, 75.0]}
          zoom={6}
          className="w-full h-[500px]"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Original route - Red */}
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

{/* Best route - Green */}
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

          {/* Start marker */}
          <Marker position={[originalRoute[0].lat, originalRoute[0].lng]}>
            <Popup>Bangalore (Origin)</Popup>
          </Marker>

          {/* End marker */}
          <Marker position={[originalRoute[originalRoute.length - 1].lat, originalRoute[originalRoute.length - 1].lng]}>
            <Popup>Mumbai (Destination)</Popup>
          </Marker>

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