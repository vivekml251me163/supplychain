'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Map, Clock, Package, CheckCircle, Truck } from 'lucide-react'
import RoadManagerRouteForm from './RoadManagerRouteForm'

interface ManagerPanelClientProps {
  managerRoutes: any[]
  pendingRoutes: any[]
  activeRoutes: any[]
  completedRoutes: any[]
  allAssignments: any[]
  uniqueDrivers: any[]
}

export default function ManagerPanelClient({
  managerRoutes,
  pendingRoutes,
  activeRoutes,
  completedRoutes,
  allAssignments,
  uniqueDrivers,
}: ManagerPanelClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const displayAssignments =
    activeTab === 'active'
      ? allAssignments.filter((a) => !a.assignment.workDone)
      : activeTab === 'completed'
        ? allAssignments.filter((a) => a.assignment.workDone)
        : allAssignments

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Manager Panel</h1>
              <p className="text-gray-600 mt-2">Manage delivery routes and monitor driver assignments across your operations</p>
            </div>
            <span className="inline-flex items-center px-4 py-2 rounded-full font-bold text-xs bg-green-100 text-green-800">
              SYSTEM STATUS: OPTIMAL
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Routes</p>
              <Map className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{managerRoutes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pending</p>
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{pendingRoutes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active</p>
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{activeRoutes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Completed</p>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-600">{completedRoutes.length}</p>
          </div>
        </div>

        {/* Create New Assignment Section */}
        <div className="mb-12">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-bold shadow-md transition transition-all"
          >
            {showCreateForm ? '✕ Close Form' : '➕ Create New Assignment'}
          </button>

          {showCreateForm && (
            <div className="mb-12">
              <RoadManagerRouteForm />
            </div>
          )}
        </div>

        {/* Regional Drivers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-12 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Regional Drivers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wide">Driver Name</th>
                  <th className="px-8 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wide">Contact Email</th>
                  <th className="px-8 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wide">Assignments</th>
                  <th className="px-8 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wide">Status</th>
                  <th className="px-8 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {uniqueDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-gray-500">
                      No drivers assigned yet
                    </td>
                  </tr>
                ) : (
                  uniqueDrivers.slice(0, 10).map((driver) => {
                    const driverAssignmentCount = allAssignments.filter(
                      (a) => a.driverUser?.id === driver.driverUser?.id
                    ).length

                    return (
                      <tr key={driver.driverUser?.id} className="hover:bg-gray-50 transition">
                        <td className="px-8 py-4 font-semibold text-gray-900">{driver.driverUser?.name || 'Unknown'}</td>
                        <td className="px-8 py-4 text-gray-600">{driver.driverUser?.email || 'N/A'}</td>
                        <td className="px-8 py-4 font-semibold text-gray-900">{driverAssignmentCount}</td>
                        <td className="px-8 py-4">
                          {driver.driverProfile?.onWork ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              ● Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                              ● Standby
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-4">
                          <Link
                            href={`/manager/assignment/${allAssignments.find((a) => a.driverUser?.id === driver.driverUser?.id)?.assignment?.id}`}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Assignments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">All Assignments</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded font-semibold text-xs uppercase transition ${activeTab === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded font-semibold text-xs uppercase transition ${activeTab === 'active'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded font-semibold text-xs uppercase transition ${activeTab === 'completed'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Completed
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wide">Driver</th>
                  <th className="px-8 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wide">Route Type</th>
                  <th className="px-8 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wide">Assigned Date</th>
                  <th className="px-8 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wide">Status</th>
                  <th className="px-8 py-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-gray-500">
                      No assignments found
                    </td>
                  </tr>
                ) : (
                  displayAssignments.map((detail) => (
                    <tr key={detail.assignment?.id} className="hover:bg-gray-50 transition">
                      <td className="px-8 py-4 font-semibold text-gray-900">{detail.driverUser?.name || 'Unknown'}</td>
                      <td className="px-8 py-4 text-gray-600">{detail.assignment?.routeType || 'Standard'}</td>
                      <td className="px-8 py-4 text-gray-600">
                        {detail.assignment?.assignedAt
                          ? new Date(detail.assignment.assignedAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-8 py-4">
                        {detail.assignment?.workDone ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                            In Transit
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-4">
                        <Link
                          href={`/manager/assignment/${detail.assignment?.id}`}
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Routes Cards */}
        {managerRoutes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Operational Routes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeRoutes.slice(0, 3).map((route, idx) => (
                <div key={route.route.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                  {/* Route Card Image Placeholder */}
                  <div className="h-32 bg-linear-to-br from-blue-400 to-blue-600 relative flex items-center justify-center text-white">
                    <Truck className="w-12 h-12 opacity-80" />
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Route {route.route.id.slice(0, 8)}...</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {route.route.srcLat.toFixed(2)}, {route.route.srcLon.toFixed(2)} → {route.route.destLat.toFixed(2)}, {route.route.destLon.toFixed(2)}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase">Active Drivers</p>
                        <p className="text-2xl font-bold text-gray-900">{route.assignments.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase">Goods</p>
                        <p className="text-2xl font-bold text-gray-900">{Math.round(route.route.goodsAmount)}</p>
                      </div>
                    </div>

                    <Link
                      href={`/manager/assignment/${route.assignments[0]?.assignment?.id}`}
                      className="w-full block text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                    >
                      📍 View on Map
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
