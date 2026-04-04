'use client'

import { useState, useEffect, useCallback } from 'react'
import { Newspaper, ExternalLink, Globe, Tag, X, Loader2, MapPin } from 'lucide-react'
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

interface NewsItem {
  id: number
  title: string
  description: string | null
  link: string | null
  imageUrl: string | null
  country: string | null
  category: string | null
  sourceUrl: string | null
  sourceName: string | null
  sourceIcon: string | null
  pubDate: string | null
}

export default function ShipManagerClient() {
  const [selectedReroute, setSelectedReroute] = useState<ShipReroute | null>(null)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)

  useEffect(() => {
    const savedReroute = localStorage.getItem('selectedReroute')
    if (savedReroute) {
      try {
        setSelectedReroute(JSON.parse(savedReroute))
      } catch (e) {
        console.error('Failed to parse saved reroute', e)
      }
    }
  }, [])

  // Fetch news details when reroute changes
  const fetchNews = useCallback(async (newsIds: number[]) => {
    if (!newsIds || newsIds.length === 0) {
      setNewsItems([])
      return
    }
    setNewsLoading(true)
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: newsIds }),
      })
      if (res.ok) {
        const data = await res.json()
        setNewsItems(data.news || [])
      }
    } catch (err) {
      console.error('Failed to fetch news:', err)
    } finally {
      setNewsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedReroute?.affectedByNews) {
      const ids = Array.isArray(selectedReroute.affectedByNews)
        ? selectedReroute.affectedByNews
        : []
      fetchNews(ids)
    } else {
      setNewsItems([])
    }
  }, [selectedReroute, fetchNews])

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

      {/* Affected by News — Interactive Cards */}
      {selectedReroute && selectedReroute.affectedByNews && selectedReroute.affectedByNews.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Affected by News</h3>
            <span className="ml-auto text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {selectedReroute.affectedByNews.length} articles
            </span>
          </div>

          {newsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Loading news articles...</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {newsItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50/50 transition-colors duration-150 flex items-center gap-3 group"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.country && (
                        <span className="text-[11px] text-gray-500 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {item.country}
                        </span>
                      )}
                      {item.category && (
                        <span className="text-[11px] text-gray-500 flex items-center gap-0.5">
                          <Tag className="w-3 h-3" />
                          {item.category}
                        </span>
                      )}
                      {item.sourceName && (
                        <span className="text-[11px] text-gray-400">
                          {item.sourceName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}

              {/* Show IDs that didn't match any news (fallback) */}
              {newsItems.length === 0 && !newsLoading && (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No news articles found for the given IDs.
                </div>
              )}
            </div>
          )}
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

      {/* ── News Detail Popup Modal ── */}
      {selectedNews && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedNews(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-in"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modalIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Image */}
            {selectedNews.imageUrl && (
              <div className="w-full h-52 bg-gray-100 overflow-hidden shrink-0">
                <img
                  src={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
                />
              </div>
            )}

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1">
              {/* Title */}
              <h2 className="text-lg font-bold text-gray-900 leading-snug mb-3">
                {selectedNews.title}
              </h2>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedNews.country && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <MapPin className="w-3 h-3" />
                    {selectedNews.country}
                  </span>
                )}
                {selectedNews.category && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    <Tag className="w-3 h-3" />
                    {selectedNews.category}
                  </span>
                )}
                {selectedNews.sourceName && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                    <Globe className="w-3 h-3" />
                    {selectedNews.sourceName}
                  </span>
                )}
                {selectedNews.pubDate && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                    {selectedNews.pubDate}
                  </span>
                )}
              </div>

              {/* Description */}
              {selectedNews.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedNews.description}
                  </p>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                {selectedNews.link && (
                  <a
                    href={selectedNews.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Read Full Article
                  </a>
                )}
                {selectedNews.sourceUrl && (
                  <a
                    href={selectedNews.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                  >
                    {selectedNews.sourceIcon && (
                      <img src={selectedNews.sourceIcon} alt="" className="w-4 h-4 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                    <Globe className="w-4 h-4" />
                    Visit Source
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal animation keyframes */}
      <style jsx global>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
