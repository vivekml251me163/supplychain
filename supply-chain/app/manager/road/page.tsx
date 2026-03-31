import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/index'
import { assignments, users, routes, roads, drivers } from '@/db/schema'
import { eq, and, isNull, isNotNull } from 'drizzle-orm'
import RouteMapClient from '@/components/RouteMapClient'
import RoadManagerRouteForm from '@/components/RoadManagerRouteForm'

export default async function RoadManagerPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'manager' || user?.managerType !== 'road') {
    redirect('/')
  }

  // Get all routes created by this manager
  const managerRoutes = await db
    .select()
    .from(routes)
    .where(eq(routes.managerId, user.id))

  // Get pending routes (no assignment yet)
  const pendingRoutes = managerRoutes.filter((r) => !r.assignmentId)

  // Get routes with assignments
  const assignedRoutes = managerRoutes.filter((r) => r.assignmentId)

  // Get detailed information for assigned routes
  const assignedRoutesWithDetails = await Promise.all(
    assignedRoutes.map(async (route) => {
      // Get assignment details
      const assignmentResult = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, route.assignmentId!))
      const assignment = assignmentResult[0] || null

      // Get road details
      const roadResult = await db
        .select()
        .from(roads)
        .where(eq(roads.id, assignment?.routeId || ''))
      const road = roadResult[0] || null

      // Get driver details
      const driverUserResult = await db
        .select()
        .from(users)
        .where(eq(users.id, assignment?.driverId || ''))
      const driverUser = driverUserResult[0] || null

      // Get driver profile
      const driverProfileResult = await db
        .select()
        .from(drivers)
        .where(eq(drivers.userId, assignment?.driverId || ''))
      const driverProfile = driverProfileResult[0] || null

      return {
        route,
        assignment,
        road,
        driverUser,
        driverProfile,
      }
    })
  )

  const activeRoutes = assignedRoutesWithDetails.filter(
    (item) => item.assignment && !item.assignment.workDone
  )
  const completedRoutes = assignedRoutesWithDetails.filter(
    (item) => item.assignment && item.assignment.workDone
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Road Manager Dashboard</h1>
        <p className="text-gray-600 mb-8">
          Create delivery routes and monitor assignments. ML system will assign drivers to pending routes.
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">Pending Routes</p>
            <p className="text-3xl font-bold text-orange-600">{pendingRoutes.length}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting ML assignment</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">Active Deliveries</p>
            <p className="text-3xl font-bold text-blue-600">{activeRoutes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">Completed Deliveries</p>
            <p className="text-3xl font-bold text-green-600">{completedRoutes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">Total Routes</p>
            <p className="text-3xl font-bold text-indigo-600">{managerRoutes.length}</p>
          </div>
        </div>

        {/* Create New Route Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Delivery Route</h2>
          <RoadManagerRouteForm managerId={user.id} />
        </div>

        {/* Pending Routes Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Routes (Awaiting ML Assignment)</h2>
          {pendingRoutes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">No pending routes. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRoutes.map((route) => (
                <div
                  key={route.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border-l-4 border-orange-500"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Route {route.id.slice(0, 8)}...
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Status: <span className="font-semibold text-orange-600">Pending ML Assignment</span>
                        </p>
                      </div>
                      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                        📋 Pending
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-2">Pickup Location</p>
                        <p className="text-gray-900 text-sm">
                          {route.srcLat.toFixed(4)}, {route.srcLon.toFixed(4)}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-2">Delivery Location</p>
                        <p className="text-gray-900 text-sm">
                          {route.destLat.toFixed(4)}, {route.destLon.toFixed(4)}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-2">Goods Amount</p>
                        <p className="text-gray-900 text-lg font-semibold">
                          {route.goodsAmount.toFixed(2)} units
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Created: {route.createdAt ? new Date(route.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Deliveries Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Deliveries</h2>
          {activeRoutes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">No active deliveries right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRoutes.map((item) => (
                <div
                  key={item.route.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border-l-4 border-blue-500"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {(item.road as any)?.origin?.name || 'Pickup'} →{' '}
                          {(item.road as any)?.destination?.name || 'Delivery'}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Driver: <span className="font-semibold text-gray-900">{item.driverUser?.name || 'N/A'}</span>
                        </p>
                      </div>
                      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        In Progress
                      </span>
                    </div>
                  </div>

                  {/* Driver & Route Info */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      {/* Driver Current Location */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Driver Current Location</h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Lat:</span> {item.driverProfile?.lat.toFixed(4) || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Lon:</span> {item.driverProfile?.lon.toFixed(4) || 'N/A'}
                          </p>
                          {item.driverProfile?.updatedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Updated: {new Date(item.driverProfile.updatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Driver Truck Capacity */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Driver Truck Capacity</h4>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {item.driverProfile?.capacity.toFixed(2) || 'N/A'} units
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Goods to deliver:</span> {item.route.goodsAmount.toFixed(2)} units
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Route Coordinates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-2">Pickup Location</p>
                        <p className="text-gray-900 text-sm">
                          {item.route.srcLat.toFixed(4)}, {item.route.srcLon.toFixed(4)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-2">Delivery Location</p>
                        <p className="text-gray-900 text-sm">
                          {item.route.destLat.toFixed(4)}, {item.route.destLon.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Route Info */}
                  {(item.road as any)?.bestRoute && (
                    <div className="p-6 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3">Route Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <p className="text-sm text-indigo-900">
                            <strong>Best Route Distance:</strong> {(item.road as any).bestRoute.distance_km?.toFixed(2)} km
                          </p>
                          <p className="text-sm text-indigo-900">
                            <strong>Duration:</strong> {(item.road as any).bestRoute.duration_hrs?.toFixed(1)} hours
                          </p>
                        </div>
                        {(item.road as any)?.originalRoute && (
                          <div className="bg-amber-50 p-4 rounded-lg">
                            <p className="text-sm text-amber-900">
                              <strong>Original Route Distance:</strong> {(item.road as any).originalRoute.distance_km?.toFixed(2)} km
                            </p>
                            <p className="text-sm text-amber-900">
                              <strong>Duration:</strong> {(item.road as any).originalRoute.duration_hrs?.toFixed(1)} hours
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Map */}
                  {(item.road as any)?.bestRoute && (
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                      <h4 className="font-semibold text-gray-800 mb-4">Route Visualization</h4>
                      <RouteMapClient
                        originalRoute={(item.road as any).originalRoute?.waypoints || []}
                        bestRoute={(item.road as any).bestRoute?.waypoints || []}
                        reasons={(item.road as any).reasons?.map((r: any) => r.description) || []}
                      />
                    </div>
                  )}

                  {/* Assignment Details */}
                  <div className="p-6 bg-gray-50 text-xs text-gray-500 flex justify-between">
                    <div>
                      <p>Assigned: {item.assignment?.assignedAt ? new Date(item.assignment.assignedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-mono">{item.assignment?.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Deliveries Section */}
        {completedRoutes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Completed Deliveries</h2>
            <div className="space-y-4">
              {completedRoutes.map((item) => (
                <div
                  key={item.route.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition opacity-75 border-l-4 border-green-500"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {(item.road as any)?.origin?.name || 'Pickup'} →{' '}
                        {(item.road as any)?.destination?.name || 'Delivery'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Driver: <span className="font-semibold">{item.driverUser?.name || 'N/A'}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Completed: {item.assignment?.completedAt ? new Date(item.assignment.completedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      ✓ Completed
                    </span>
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
