'use client'

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useState } from 'react'

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface WeatherResultWithLocation {
  id: number
  weatherId: number | null
  aiSummary: string
  consequence: string
  radiusKm: number
  severity: number
  confidence: number
  createdAt: string
  locationName: string | null
  latitude: number | null
  longitude: number | null
}

interface WeatherAlertsMapProps {
  weather: WeatherResultWithLocation[]
}

function getSeverityConfig(severity: number) {
  if (severity >= 5) return { color: '#dc2626', label: 'Critical' }
  if (severity >= 4) return { color: '#ea580c', label: 'High' }
  if (severity >= 3) return { color: '#f59e0b', label: 'Medium' }
  if (severity >= 2) return { color: '#84cc16', label: 'Low' }
  return { color: '#10b981', label: 'Minimal' }
}

export default function WeatherAlertsMap({ weather }: WeatherAlertsMapProps) {
  const mapWeather = weather.filter(w => w.latitude != null && w.longitude != null)

  if (mapWeather.length === 0) {
    return null
  }

  const lats = mapWeather.map(w => w.latitude!)
  const lons = mapWeather.map(w => w.longitude!)
  
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)
  
  const centerLat = (minLat + maxLat) / 2
  const centerLon = (minLon + maxLon) / 2

  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0 mb-8">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-900">Weather Geography</h3>
        <p className="text-xs text-gray-500">Mapping {mapWeather.length} weather alerts</p>
      </div>

      <MapContainer
        center={[centerLat, centerLon]}
        zoom={2}
        minZoom={2}
        style={{ height: '400px', width: '100%' }}
        maxBounds={[[-85, -180], [85, 180]]}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          noWrap={true}
        />

        {mapWeather.map((w) => {
          const lat = w.latitude!
          const lon = w.longitude!
          const { color, label } = getSeverityConfig(w.severity)
          
          return (
            <div key={w.id}>
              <Circle
                center={[lat, lon]}
                radius={w.radiusKm * 1000} // radius in meters
                pathOptions={{ 
                  color: color, 
                  fill: true, 
                  fillColor: color,
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '4, 4'
                }}
              />
              <Marker position={[lat, lon]}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold text-gray-900 mb-1">{w.locationName || 'Unknown Location'}</p>
                    <p className="font-semibold mb-1" style={{ color }}>{label} Severity: {w.severity}/5</p>
                    <p className="text-gray-700 line-clamp-3 leading-snug break-words max-w-[200px]">{w.aiSummary}</p>
                  </div>
                </Popup>
              </Marker>
            </div>
          )
        })}
      </MapContainer>
    </div>
  )
}
