'use client'

import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface RoutePoint {
  lat: number
  lon: number
}

interface AssignmentDetailMapProps {
  bestRoute: RoutePoint[] | null
  reasons: any
}

export default function AssignmentDetailMap({ bestRoute, reasons }: AssignmentDetailMapProps) {
  if (!bestRoute || bestRoute.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center flex items-center justify-center" style={{ height: '500px' }}>
        <p className="text-gray-500">No route data available</p>
      </div>
    )
  }

  const startPoint = bestRoute[0]
  const endPoint = bestRoute[bestRoute.length - 1]
  const center: [number, number] = [
    (startPoint.lat + endPoint.lat) / 2,
    (startPoint.lon + endPoint.lon) / 2,
  ]

  return (
    <MapContainer center={center} zoom={10} style={{ height: '500px', width: '100%' }} className="rounded-lg">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      
      {/* Start Point */}
      <Marker position={[startPoint.lat, startPoint.lon]}>
        <Popup>
          <div className="text-sm">
            <p className="font-semibold">Start</p>
            <p>{startPoint.lat.toFixed(4)}, {startPoint.lon.toFixed(4)}</p>
          </div>
        </Popup>
      </Marker>

      {/* End Point */}
      <Marker position={[endPoint.lat, endPoint.lon]}>
        <Popup>
          <div className="text-sm">
            <p className="font-semibold">End</p>
            <p>{endPoint.lat.toFixed(4)}, {endPoint.lon.toFixed(4)}</p>
          </div>
        </Popup>
      </Marker>

      {/* Route Line */}
      <Polyline
        positions={bestRoute.map((p) => [p.lat, p.lon])}
        color="blue"
        weight={3}
        opacity={0.7}
      />
    </MapContainer>
  )
}
