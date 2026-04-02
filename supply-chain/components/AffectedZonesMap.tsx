'use client'

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

interface Zone {
  id: number
  centerLat: number
  centerLong: number
  radiusKm: number
  severity: number
  aiSummary: string
  consequence: string
  confidence: number
}

interface AffectedZonesMapProps {
  zones: Zone[]
}

const MAP_RADIUS_THRESHOLD_KM = 3500
const TILES_PER_PAGE = 6

// severity is out of 5
function getSeverityConfig(severity: number) {
  if (severity >= 5) return { color: '#dc2626', label: 'Critical', tailwind: 'bg-red-100 text-red-700' }
  if (severity >= 4) return { color: '#ea580c', label: 'High',     tailwind: 'bg-orange-100 text-orange-700' }
  if (severity >= 3) return { color: '#f59e0b', label: 'Medium',   tailwind: 'bg-yellow-100 text-yellow-700' }
  if (severity >= 2) return { color: '#84cc16', label: 'Low',      tailwind: 'bg-lime-100 text-lime-700' }
  return               { color: '#10b981', label: 'Minimal',  tailwind: 'bg-emerald-100 text-emerald-700' }
}

export default function AffectedZonesMap({ zones }: AffectedZonesMapProps) {
  const mapRef        = useRef<any>(null)
  const containerRef  = useRef<HTMLDivElement>(null)
  const circlesRef    = useRef<Map<number, any>>(new Map())
  const selectedRef   = useRef<number | null>(null)

  const [loading,     setLoading]     = useState(true)
  const [selectedId,  setSelectedId]  = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // filter + sort by severity (highest first), then by radius
  const mapZones = zones
    .filter(z => z.radiusKm <= MAP_RADIUS_THRESHOLD_KM)
    .sort((a, b) => {
      if (a.severity !== b.severity) {
        return b.severity - a.severity  // Higher severity first
      }
      return b.radiusKm - a.radiusKm    // Then larger radius first
    })

  const avgLat = mapZones.length > 0 ? mapZones.reduce((s, z) => s + z.centerLat,  0) / mapZones.length : 10
  const avgLng = mapZones.length > 0 ? mapZones.reduce((s, z) => s + z.centerLong, 0) / mapZones.length : 80

  // pagination
  const totalPages   = Math.ceil(mapZones.length / TILES_PER_PAGE)
  const startIndex   = (currentPage - 1) * TILES_PER_PAGE
  const currentZones = mapZones.slice(startIndex, startIndex + TILES_PER_PAGE)

  // apply fading/highlight to all circles
  function applyStyles(activeId: number | null) {
    circlesRef.current.forEach((circle, id) => {
      if (activeId === null) {
        circle.setStyle({ fillOpacity: 0, opacity: 0.3, weight: 1 })
      } else if (id === activeId) {
        circle.setStyle({ fillOpacity: 0.1, opacity: 1, weight: 3 })
        circle.bringToFront()
      } else {
        circle.setStyle({ fillOpacity: 0, opacity: 0.08, weight: 1 })
      }
    })
  }

  function select(id: number | null) {
    selectedRef.current = id
    setSelectedId(id)
    applyStyles(id)
  }

  function handleTileClick(zone: Zone) {
    const newId = selectedRef.current === zone.id ? null : zone.id
    select(newId)
    if (newId !== null && mapRef.current) {
      // zoom level based on radius size
      const zoom = Math.min(10, Math.max(4, 5 - Math.log10(zone.radiusKm)))
      mapRef.current.flyTo([zone.centerLat, zone.centerLong], zoom, { duration: 1.2 })
      const circle = circlesRef.current.get(zone.id)
      if (circle) setTimeout(() => circle.openPopup(),500)
    }
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then(({ default: L }) => {
      const map = L.map(containerRef.current!, {
        center:               [avgLat, avgLng],
        zoom:                 4,
        minZoom:              2,
        maxZoom:              18,
        scrollWheelZoom:      true,
        maxBounds:            [[-90, -180], [90, 180]],
        maxBoundsViscosity:   1.0,
        zoomControl:          false,
      })

      mapRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        noWrap:      true,
      }).addTo(map)

      // click map background = deselect
      map.on('click', () => select(null))

      mapZones.forEach(zone => {
        const { color, label } = getSeverityConfig(zone.severity)
        const confidencePct    = Math.round(zone.confidence * 100)

        const circle = L.circle([zone.centerLat, zone.centerLong], {
          radius:              zone.radiusKm * 1000,
          color,
          fillColor:           color,
          fillOpacity:         0,
          opacity:             0.1,
          weight:              1,
          bubblingMouseEvents: false,
        })

        circle.on('mouseover', () => {
          if (selectedRef.current !== null) return
          circle.setStyle({ fillOpacity: 0.15, opacity: 0.8, weight: 2 })
        })

        circle.on('mouseout', () => {
          if (selectedRef.current !== null) return
          circle.setStyle({ fillOpacity: 0, opacity: 0.1, weight: 1 })
        })

        circle.on('click', (e: any) => {
          L.DomEvent.stopPropagation(e)
          const newId = selectedRef.current === zone.id ? null : zone.id
          select(newId)
          if (newId === null) circle.closePopup()
        })

        circle.bindPopup(`
          <div style="min-width:280px;font-family:Inter,sans-serif;padding:6px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <span style="background:${color}20;color:${color};font-size:10px;font-weight:800;padding:3px 10px;border-radius:6px;text-transform:uppercase;letter-spacing:1px">
                ${label}
              </span>
              <span style="font-size:13px;font-weight:800;color:${color}">${zone.severity}/5</span>
            </div>
            <p style="font-size:12px;font-weight:700;color:#111827;margin:0 0 5px;letter-spacing:0.5px">📋 AI Summary</p>
            <p style="font-size:13px;font-weight:600;color:#1f2937;margin:0 0 12px;line-height:1.3 ;padding:8px;border-radius:6px">${zone.aiSummary}</p>
            <p style="font-size:12px;font-weight:600;color:#111827;margin:0 0 5px;letter-spacing:0.5px">⚠️ CONSEQUENCE</p>
            <p style="font-size:13px;font-weight:600;color:#1f2937;margin:0 0 12px;line-height:1.3;padding:8px;border-radius:6px">${zone.consequence}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:10px;border-top:1px solid #e5e7eb">
              <div>
                <p style="font-size:9px;text-transform:uppercase;color:#9ca3af;font-weight:700;margin:0 0 3px">Radius</p>
                <p style="font-size:12px;font-weight:800;color:#111827;margin:0">${zone.radiusKm.toFixed(0)} km</p>
              </div>
              <div>
                <p style="font-size:9px;text-transform:uppercase;color:#9ca3af;font-weight:700;margin:0 0 3px">Confidence</p>
                <p style="font-size:12px;font-weight:800;color:${color};margin:0">${confidencePct}%</p>
              </div>
            </div>
          </div>
        `, { maxWidth: 320 })

        circle.addTo(map)
        circlesRef.current.set(zone.id, circle)
      })

      setLoading(false)
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

      {/* ── Map ── */}
      <div className="relative h-[750px] w-full">

        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin mb-2" />
            <p className="text-sm text-gray-500 font-medium">Loading map...</p>
          </div>
        )}

        <div ref={containerRef} className="h-full w-full" />

        {/* Zoom buttons */}
        <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-11 h-11 bg-white border border-gray-200 rounded-xl shadow-md flex items-center justify-center text-gray-700 text-lg font-bold hover:bg-gray-50 transition"
          >+</button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-11 h-11 bg-white border border-gray-200 rounded-xl shadow-md flex items-center justify-center text-gray-700 text-lg font-bold hover:bg-gray-50 transition"
          >−</button>
          <button
            onClick={() => { mapRef.current?.setView([avgLat, avgLng], 4); select(null) }}
            className="w-11 h-11 bg-emerald-500 text-white rounded-xl shadow-md flex items-center justify-center text-sm font-bold hover:bg-emerald-600 transition"
            title="Reset view"
          >⊙</button>
        </div>

        {/* Status badge */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 shadow-md">
          <p className="text-xs font-semibold text-gray-700">
            {selectedId !== null
              ? '✓ Zone selected · click map to clear'
              : `${mapZones.length} zone${mapZones.length !== 1 ? 's' : ''} · click to focus`}
          </p>
        </div>
      </div>

      {/* ── Tiles ── */}
      <div className="border-t border-gray-200 bg-gray-50">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Zone Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {startIndex + 1}–{Math.min(startIndex + TILES_PER_PAGE, mapZones.length)} of {mapZones.length} zones
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Page <span className="font-bold text-gray-800">{currentPage}</span> / {totalPages}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6 pb-5">
          {currentZones.map(zone => {
            const { color, label, tailwind } = getSeverityConfig(zone.severity)
            const isSelected = selectedId === zone.id

            return (
              <button
                key={zone.id}
                onClick={() => handleTileClick(zone)}
                className={`text-left p-4 rounded-xl border-2 bg-white transition-all duration-200 ${
                  isSelected
                    ? 'shadow-lg scale-[1.02]'
                    : selectedId !== null
                    ? ' border-gray-100 '
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                style={isSelected ? { borderColor: color } : {}}
              >
                {/* Badge + score */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${tailwind}`}>
                    {label}
                  </span>
                  <span className="text-sm font-black" style={{ color }}>
                    {zone.severity}/5
                  </span>
                </div>

                {/* Summary */}
                <p className="text-xs font-semibold text-gray-900 mb-1.5 line-clamp-2 leading-snug">
                  {zone.aiSummary}
                </p>

                {/* Stats */}
                <p className="text-xs text-gray-500">
                  {zone.radiusKm.toFixed(0)} km radius · {Math.round(zone.confidence * 100)}% confidence
                </p>
              </button>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 px-6 py-4 border-t border-gray-200">

            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
            >‹</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              const show = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
              if (!show) {
                if (page === 2 || page === totalPages - 1) {
                  return <span key={page} className="text-xs text-gray-400 px-1">…</span>
                }
                return null
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                    currentPage === page
                      ? 'bg-emerald-500 text-white border border-emerald-600 shadow-sm scale-110'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              )
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
            >›</button>

          </div>
        )}
      </div>

    </div>
  )
}