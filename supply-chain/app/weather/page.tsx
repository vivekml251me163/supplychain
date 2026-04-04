import { db } from '@/db/index'
import { weatherResults } from '@/db/schema'
import WeatherResultsDisplay from '@/components/WeatherResultsDisplay'

export default async function WeatherPage() {
  const weather = await db.select().from(weatherResults)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">

      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-end justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Weather Intelligence</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
                Weather Alerts & Impact Analysis
              </h1>
              <p className="text-gray-600 text-base leading-relaxed">
                Real-time AI analysis of weather events and their impact on supply chain operations. Severity: 0–5
              </p>
            </div>
            <div className="flex flex-col items-end justify-center shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black tracking-tighter text-gray-900">{weather.length}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase tracking-wider text-amber-600">Active Alert{weather.length !== 1 ? 's' : ''}</span>
                  <span className="text-sm font-medium text-gray-500">Detected in real-time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* Legend with improved styling */}
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Severity Levels</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-md"></div>
                <span className="text-xs font-bold text-gray-700">Critical (5)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-orange-600 shadow-md"></div>
                <span className="text-xs font-bold text-gray-700">High (4)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-md"></div>
                <span className="text-xs font-bold text-gray-700">Medium (3)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-lime-500 shadow-md"></div>
                <span className="text-xs font-bold text-gray-700">Low (2)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-md"></div>
                <span className="text-xs font-bold text-gray-700">Minimal (0–1)</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
            💡 Review weather alerts to understand impact on shipments, routes, and port operations.
          </p>
        </div>

        {/* Weather alerts component */}
        {weather.length === 0 ? (
          <div className="text-center py-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 border-dashed">
            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">☀️</span>
            </div>
            <p className="text-gray-600 text-lg font-semibold mb-1">No weather alerts detected</p>
            <p className="text-gray-400 text-sm">
              Weather conditions are favorable across all monitored regions
            </p>
          </div>
        ) : (
          <WeatherResultsDisplay weather={weather} />
        )}
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
