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

  // Get all assignments for these routes
  const routeIds = managerRoutes.map((r) => r.id)
  const allAssignmentsForRoutes = await db
    .select()
    .from(assignments)
    .where(({ routeId }) => routeIds.includes(routeId as any) as any)

  // Build map of route -> assignments
  const routeAssignmentsMap = new Map<string, any[]>()
  managerRoutes.forEach((route) => {
    routeAssignmentsMap.set(route.id, [])
  })
  allAssignmentsForRoutes.forEach((assignment) => {
    const assignmentsList = routeAssignmentsMap.get(assignment.routeId)
    if (assignmentsList) {
      assignmentsList.push(assignment)
    }
  })

  // Categorize routes
  const pendingRoutes = managerRoutes.filter((r) => {
    const routeAssignments = routeAssignmentsMap.get(r.id) || []
    return routeAssignments.length === 0
  })

  const assignedRoutes = managerRoutes.filter((r) => {
    const routeAssignments = routeAssignmentsMap.get(r.id) || []
    return routeAssignments.length > 0
  })

  // Get detailed information for assigned routes
  const assignedRoutesWithDetails = await Promise.all(
    assignedRoutes.map(async (route) => {
      const routeAssignments = routeAssignmentsMap.get(route.id) || []

      // Fetch details for all assignments
      const assignmentDetails = await Promise.all(
        routeAssignments.map(async (assignment) => {
          const driverUserResult = await db
            .select()
            .from(users)
            .where(eq(users.id, assignment.driverId))
          const driverUser = driverUserResult[0] || null

          const driverProfileResult = await db
            .select()
            .from(drivers)
            .where(eq(drivers.userId, assignment.driverId))
          const driverProfile = driverProfileResult[0] || null

          return {
            assignment,
            driverUser,
            driverProfile,
          }
        })
      )

      return {
        route,
        assignments: assignmentDetails,
      }
    })
  )

  const activeRoutes = assignedRoutesWithDetails.filter(
    (item) => item.assignments && item.assignments.some((a: any) => !a.assignment.workDone)
  )
  const completedRoutes = assignedRoutesWithDetails.filter(
    (item) => item.assignments && item.assignments.every((a: any) => a.assignment.workDone)
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
          <RoadManagerRouteForm />
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
                          Route {item.route.id.slice(0, 8)}...
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Assigned to <span className="font-semibold">{item.assignments.length} driver(s)</span>
                        </p>
                      </div>
                      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        In Progress
                      </span>
                    </div>
                  </div>

                  {/* Assigned Drivers */}
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">Assigned Drivers</h4>
                    <div className="space-y-4">
                      {item.assignments.map((driverAssignment: any, idx: number) => (
                        <div
                          key={driverAssignment.assignment.id}
                          className="bg-blue-50 p-4 rounded-lg border border-blue-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{driverAssignment.driverUser?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-600">
                                Quantity assigned: <span className="font-semibold">{driverAssignment.assignment.assignedQuantity.toFixed(2)} units</span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Truck capacity: <span className="font-semibold">{driverAssignment.driverProfile?.capacity.toFixed(2) || 'N/A'} units</span>
                              </p>
                              {driverAssignment.assignment.workDone ? (
                                <p className="text-sm text-green-600 mt-1">✓ Completed</p>
                              ) : (
                                <p className="text-sm text-orange-600 mt-1">⏳ In progress</p>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 text-right">
                              Current location: {driverAssignment.driverProfile?.lat.toFixed(4)}, {driverAssignment.driverProfile?.lon.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Route Coordinates */}
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">Route Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-2">Total Goods</p>
                        <p className="text-gray-900 text-lg font-semibold">
                          {item.route.goodsAmount.toFixed(2)} units
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Details */}
                  <div className="p-6 bg-gray-50 text-xs text-gray-500 flex justify-between">
                    <div>
                      <p>Created: {item.route.createdAt ? new Date(item.route.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-mono">{item.route.id}</p>
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
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border-l-4 border-green-500"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Route {item.route.id.slice(0, 8)}...
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Delivered by <span className="font-semibold">{item.assignments.length} driver(s)</span>
                        </p>
                      </div>
                      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        ✓ Completed
                      </span>
                    </div>
                  </div>

                  {/* Drivers Info */}
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">Delivery Drivers</h4>
                    <div className="space-y-3">
                      {item.assignments.map((driverAssignment: any) => (
                        <div
                          key={driverAssignment.assignment.id}
                          className="bg-green-50 p-4 rounded-lg border border-green-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{driverAssignment.driverUser?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-600">
                                Quantity delivered: <span className="font-semibold">{driverAssignment.assignment.assignedQuantity.toFixed(2)} units</span>
                              </p>
                              {driverAssignment.assignment.completedAt && (
                                <p className="text-sm text-green-600 mt-1">
                                  Completed: {new Date(driverAssignment.assignment.completedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 font-medium mb-2">Pickup</p>
                        <p className="text-sm text-gray-900">{item.route.srcLat.toFixed(4)}, {item.route.srcLon.toFixed(4)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 font-medium mb-2">Delivery</p>
                        <p className="text-sm text-gray-900">{item.route.destLat.toFixed(4)}, {item.route.destLon.toFixed(4)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 font-medium mb-2">Total Goods</p>
                        <p className="text-sm font-semibold text-gray-900">{item.route.goodsAmount.toFixed(2)} units</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Route created: {item.route.createdAt ? new Date(item.route.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
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
