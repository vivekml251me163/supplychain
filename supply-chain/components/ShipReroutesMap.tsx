'use client'

import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import PaginationControls from './PaginationControls'
import { useState, useRef, useEffect } from 'react'
import { MapIcon, Ship, MapPin, AlertTriangle, Wind, Newspaper, Check, Bot } from 'lucide-react'

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface ShipReroute {
  id: number
  shipId: number
  bestRoute: Array<[number, number]>
  affectedByNews: any
  affectedByWeather: any
  suggestion: string
  createdAt: string
}

interface ShipReroutesMapProps {
  reroutes: ShipReroute[]
}

function interpolateRoute(points: Array<[number, number]>, steps: number = 10): Array<[number, number]> {
  const result: Array<[number, number]> = []

  for (let i = 0; i < points.length - 1; i++) {
    const [fromLat, fromLon] = points[i]
    const [toLat, toLon] = points[i + 1]

    for (let t = 0; t <= steps; t++) {
      const ratio = t / steps

      // midpoint slightly offset to create natural curve
      const midLat = (fromLat + toLat) / 2 + (toLon - fromLon) * 0.05
      const midLon = (fromLon + toLon) / 2 - (toLat - fromLat) * 0.05

      // quadratic bezier curve formula
      const lat =
        (1 - ratio) * (1 - ratio) * fromLat +
        2 * (1 - ratio) * ratio * midLat +
        ratio * ratio * toLat

      const lon =
        (1 - ratio) * (1 - ratio) * fromLon +
        2 * (1 - ratio) * ratio * midLon +
        ratio * ratio * toLon

      result.push([lat, lon])
    }
  }

  return result
}

export default function ShipReroutesMap({ reroutes }: ShipReroutesMapProps) {
  const [selectedRoute, setSelectedRoute] = useState<ShipReroute | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const mapRef = useRef<L.Map | null>(null)
  const mapWrapperRef = useRef<HTMLDivElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)

  const itemsPerPage = 4 // Show 4 routes per page

  // Scroll to map when route is selected
  useEffect(() => {
    if (selectedRoute && mapWrapperRef.current) {
      setTimeout(() => {
        const scrollTop = mapWrapperRef.current?.getBoundingClientRect().top ?? 0
        const offset = scrollTop + window.scrollY - 100 // Scroll more up with 100px buffer
        window.scrollTo({ top: offset, behavior: 'smooth' })
      }, 100)
      // Reset popup position when new route is selected
      setPopupPosition({ x: 0, y: 0 })
    }
  }, [selectedRoute])

  // Handle mouse down on popup header for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!popupRef.current) return
    setIsDragging(true)
    const rect = popupRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setPopupPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    })
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Function to focus map on a specific route
  const focusOnRoute = (route: ShipReroute) => {
    if (!mapRef.current || !route.bestRoute || route.bestRoute.length === 0) return

    const lats = route.bestRoute.map(p => p[0])
    const lons = route.bestRoute.map(p => p[1])
    
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)

    // Add padding around the bounds
    const padding = 0.15
    const bounds: L.LatLngBoundsExpression = [
      [minLat - padding, minLon - padding],
      [maxLat + padding, maxLon + padding]
    ]

    mapRef.current.fitBounds(bounds, { padding: [120, 120], duration: 0.5 })
  }

  // Filter out invalid reroutes and validate bestRoute data
  const validReroutes = reroutes.filter(
    r => r && r.bestRoute && Array.isArray(r.bestRoute) && r.bestRoute.length > 0
  )

  if (!validReroutes || validReroutes.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md p-6 text-center">
        <p className="text-gray-500">No valid reroutes available to display on map</p>
      </div>
    )
  }

  // Calculate bounds from all valid routes
  const allPoints = validReroutes.flatMap(r => {
    return Array.isArray(r.bestRoute) ? r.bestRoute : []
  }).filter(p => p && Array.isArray(p) && p.length >= 2)
  
  if (allPoints.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md p-6 text-center">
        <p className="text-gray-500">No valid route coordinates found</p>
      </div>
    )
  }

  const lats = allPoints.map(p => p[0])
  const lons = allPoints.map(p => p[1])
  
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)
  
  const centerLat = (minLat + maxLat) / 2
  const centerLon = (minLon + maxLon) / 2

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

  return (
    <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md relative z-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-gray-800 text-lg font-bold flex items-center gap-2"><MapIcon className="w-5 h-5 text-blue-600" /> Ship Reroutes Map</h2>
        <p className="text-gray-500 text-sm">Best routes suggested by AI based on weather and news impacts</p>
      </div>

      {/* Map Section - relative container for popup */}
      <div className="relative" ref={mapWrapperRef}>
        {/* Map Container */}
        <MapContainer
        ref={mapRef}
        center={[centerLat, centerLon]}
        zoom={4}
        minZoom={2}
        maxZoom={18}
        style={{ height: '50vh', minHeight: '400px', maxHeight: '600px', width: '100%' }}
        maxBounds={[[-85, -180], [85, 180]]}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          noWrap={true}
        />

        {/* Render each reroute */}
        {validReroutes.map((reroute, idx) => {
          // Validate bestRoute array
          if (!reroute.bestRoute || !Array.isArray(reroute.bestRoute) || reroute.bestRoute.length < 2) {
            return null
          }

          const color = colors[idx % colors.length]
          const smoothRoute = interpolateRoute(reroute.bestRoute, 15)
          const routePositions = smoothRoute.map(p => [p[0], p[1]] as [number, number])
          
          const startPoint = reroute.bestRoute[0]
          const endPoint = reroute.bestRoute[reroute.bestRoute.length - 1]

          // Validate points
          if (!startPoint || !endPoint || !Array.isArray(startPoint) || !Array.isArray(endPoint)) {
            return null
          }

          const startLat = startPoint[0]
          const startLon = startPoint[1]
          const endLat = endPoint[0]
          const endLon = endPoint[1]

          // Validate coordinates are valid numbers
          if (
            typeof startLat !== 'number' || typeof startLon !== 'number' ||
            typeof endLat !== 'number' || typeof endLon !== 'number' ||
            isNaN(startLat) || isNaN(startLon) || isNaN(endLat) || isNaN(endLon)
          ) {
            return null
          }

          return (
            <div key={reroute.id}>
              {/* Invisible clickable overlay - larger hit area */}
              <Polyline
                positions={routePositions}
                color="transparent"
                weight={15}
                opacity={0}
                smoothFactor={5}
                eventHandlers={{
                  click: () => setSelectedRoute(reroute)
                }}
                className="cursor-pointer"
              />

              {/* Route Line */}
              <Polyline
                positions={routePositions}
                color={color}
                weight={5}
                opacity={0.8}
                smoothFactor={5}
                eventHandlers={{
                  click: () => setSelectedRoute(reroute)
                }}
                className="cursor-pointer hover:opacity-100"
              />

              {/* Start Point Marker */}
              <Marker position={[startLat, startLon]}>
                <Popup>
                  <div className="text-sm font-semibold">
                    <p className="flex items-center gap-1.5"><Ship className="w-4 h-4 text-gray-500" /> Ship {reroute.shipId}</p>
                    <p className="text-xs text-gray-600 mt-1">Route Start</p>
                    <p className="text-xs mt-1">{startLat.toFixed(4)}°, {startLon.toFixed(4)}°</p>
                  </div>
                </Popup>
              </Marker>

              {/* End Point Marker */}
              <Marker position={[endLat, endLon]}>
                <Popup>
                  <div className="text-sm font-semibold">
                    <p className="flex items-center gap-1.5"><Ship className="w-4 h-4 text-gray-500" /> Ship {reroute.shipId}</p>
                    <p className="text-xs text-gray-600 mt-1">Route End</p>
                    <p className="text-xs mt-1">{endLat.toFixed(4)}°, {endLon.toFixed(4)}°</p>
                  </div>
                </Popup>
              </Marker>

              {/* Weather Impact Zone - visual indicator */}
              {reroute.affectedByWeather?.severity && (
                <Circle
                  center={[centerLat, centerLon]}
                  radius={Math.max(50000, reroute.affectedByWeather.severity * 20000)}
                  pathOptions={{ 
                    color: color, 
                    fill: true, 
                    fillColor: color,
                    fillOpacity: 0.05,
                    weight: 1,
                    dashArray: '5, 5'
                  }}
                />
              )}
            </div>
          )
        })}

      </MapContainer>

      {/* Route Details Popup Card - appears over map */}
      {selectedRoute && (
        <div 
          ref={popupRef}
          className="fixed z-[1000] pointer-events-auto"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            right: popupPosition.x === 0 ? '24px' : 'auto',
            userSelect: isDragging ? 'none' : 'auto'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white rounded-xl shadow-lg border border-gray-200 w-80 max-h-96 overflow-y-auto flex flex-col"
          >
            {/* Popup Header - Draggable */}
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white flex justify-between items-center border-b border-blue-700 flex-shrink-0 cursor-move select-none"
              onMouseDown={handleMouseDown}
            >
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2"><Ship className="w-4 h-4 text-blue-600" /> Ship {selectedRoute.shipId}</h2>
              </div>
              <button
                onClick={() => setSelectedRoute(null)}
                className="text-white hover:bg-blue-700 p-1 rounded transition text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-3 space-y-2 overflow-y-auto flex-1">
              
              {/* AI Summary Section */}
              {selectedRoute.suggestion && (
                <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {selectedRoute.suggestion}
                  </p>
                </div>
              )}

              {/* Route Coordinates */}
              {selectedRoute.bestRoute && selectedRoute.bestRoute.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 text-xs">
                  <p className="text-gray-600 font-semibold mb-1 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-500" /> Route Points</p>
                  <div className="space-y-0.5">
                    <div>
                      <p className="text-gray-600 text-[10px]">Start:</p>
                      <p className="font-mono text-gray-800 text-[9px]">
                        {selectedRoute.bestRoute[0][0].toFixed(4)}°, {selectedRoute.bestRoute[0][1].toFixed(4)}°
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-[10px]">End:</p>
                      <p className="font-mono text-gray-800 text-[9px]">
                        {selectedRoute.bestRoute[selectedRoute.bestRoute.length - 1][0].toFixed(4)}°, {selectedRoute.bestRoute[selectedRoute.bestRoute.length - 1][1].toFixed(4)}°
                      </p>
                    </div>
                    <p className="text-gray-600 text-[10px]">Waypoints: <span className="font-bold">{selectedRoute.bestRoute.length}</span></p>
                  </div>
                </div>
              )}

              {/* Impact Factors */}
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 text-xs">
                <p className="text-gray-600 font-semibold mb-1 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-orange-500" /> Impacts</p>
                <div className="space-y-1">
                  {selectedRoute.affectedByWeather ? (
                    <div className="p-1 bg-orange-50 border border-orange-200 rounded text-[10px]">
                      <p className="font-bold text-orange-700">Weather</p>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-500">No weather impact</div>
                  )}
                  {selectedRoute.affectedByNews ? (
                    <div className="p-1 bg-blue-50 border border-blue-200 rounded text-[10px]">
                      <p className="font-bold text-blue-700">News</p>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-500">No news impact</div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-600 text-[10px]">Ship ID</p>
                    <p className="font-bold text-gray-800 text-sm">{selectedRoute.shipId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-[10px]">Route ID</p>
                    <p className="font-bold text-gray-800 text-sm">{selectedRoute.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Route Details Below Map */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-800">Route Details</h3>
          <div className="text-xs text-gray-600">
            Page {currentPage} of {Math.ceil(validReroutes.length / itemsPerPage)}
          </div>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {validReroutes
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((reroute, idx) => {
              const color = colors[(validReroutes.indexOf(reroute)) % colors.length]
              return (
                <div 
                  key={reroute.id} 
                  onClick={() => {
                    setSelectedRoute(reroute)
                    focusOnRoute(reroute)
                  }}
                  className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: color }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">Ship {reroute.shipId}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {reroute.suggestion || 'No suggestion provided'}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {reroute.affectedByWeather && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                            <Wind className="w-3 h-3" /> Weather
                          </span>
                        )}
                        {reroute.affectedByNews && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            <Newspaper className="w-3 h-3" /> News
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center pt-4 border-t border-gray-200">
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(validReroutes.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}
