import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/index'
import { shipReroutes } from '@/db/schema'
import ShipReroutesMapClient from '@/components/ShipReroutesMapClient'

export default async function ShipReroutesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Fetch all ship reroutes
  const reroutes = await db.select().from(shipReroutes)

  // Group reroutes by shipId
  const groupedReroutes = reroutes.reduce((acc: Record<number, typeof reroutes>, reroute) => {
    if (!acc[reroute.shipId]) {
      acc[reroute.shipId] = []
    }
    acc[reroute.shipId].push(reroute)
    return acc
  }, {} as Record<number, (typeof reroutes)[number][]>)

  // Get unique ship IDs from reroutes
  const uniqueShipIds = Object.keys(groupedReroutes).map(Number)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-end justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Ship Operations</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
                Ship Reroutes & Optimization
              </h1>
              <p className="text-gray-600 text-base leading-relaxed">
                AI-optimized routes for ships based on weather and news impacts. View reroute details and map visualization.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <span className="text-4xl font-black text-blue-600">{reroutes.length}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Reroute{reroutes.length !== 1 ? 's' : ''}</span>
                  <span className="text-xs text-blue-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map - 2 columns */}
          <div className="lg:col-span-2">
            {reroutes.length > 0 ? (
              <ShipReroutesMapClient reroutes={reroutes as any} />
            ) : (
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">No ship reroutes available</p>
              </div>
            )}
          </div>

          {/* Ship Details Sidebar - 1 column */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b border-blue-700">
                <h2 className="text-lg font-bold">🚢 Ships with Reroutes</h2>
                <p className="text-blue-100 text-xs mt-1">{uniqueShipIds.length} ship{uniqueShipIds.length !== 1 ? 's' : ''}</p>
              </div>

              {/* Ship List */}
              <div className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
                {uniqueShipIds.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No ships with active reroutes
                  </div>
                ) : (
                  uniqueShipIds.map((shipId) => {
                    const shipRerouteList = groupedReroutes[shipId] || []
                    const shipRerouteCount = shipRerouteList.length
                    const shipRerouteInfo = shipRerouteList.at(0)

                    return (
                      <div key={shipId} className="p-4 hover:bg-gray-50 transition">
                        {/* Ship Info */}
                        <div className="mb-3">
                          <h3 className="font-bold text-gray-800 text-sm mb-1">Ship #{shipId}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              {shipRerouteCount} Reroute{shipRerouteCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Route Details */}
                        {shipRerouteInfo && (
                          <div className="space-y-2 text-xs">
                            {/* Suggestion */}
                            {shipRerouteInfo.suggestion && (
                              <div>
                                <p className="text-gray-600 font-semibold">💡 Suggestion:</p>
                                <p className="text-gray-700">{shipRerouteInfo.suggestion}</p>
                              </div>
                            )}

                            {/* Impacts */}
                            <div className="flex gap-1 flex-wrap mt-2 pt-2 border-t border-gray-200">
                              {shipRerouteInfo.affectedByWeather && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-semibold">
                                  🌪️ Weather
                                </span>
                              )}
                              {shipRerouteInfo.affectedByNews && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold">
                                  📰 News
                                </span>
                              )}
                            </div>

                            {/* Created timestamp */}
                            {shipRerouteInfo.createdAt && (
                              <div className="pt-2 border-t border-gray-200">
                                <p className="text-gray-500 text-[10px]">
                                  Created: {new Date(shipRerouteInfo.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 mt-20 py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-black tracking-tighter text-white">
              SupplyChain AI
            </span>
            <p className="text-xs text-gray-400">Intelligent supply chain optimization</p>
          </div>
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </footer>
    </main>
  )
}
