import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/index'
import { assignments, routes, users, drivers } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import DriverLocationTracker from '@/components/DriverLocationTracker'
import DriverAssignmentCard from '@/components/DriverAssignmentCard'
import DriverProfileUpdate from '@/components/DriverProfileUpdate'

export default async function DriverPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'driver') redirect('/')
  if (!user?.isVerified) redirect('/')

  // Get driver profile
  const driverProfile = await db
    .select()
    .from(drivers)
    .where(eq(drivers.userId, user.id))

  // Get all ROAD assignments for this driver
  const myAssignments = await db
    .select()
    .from(assignments)
    .where(
      and(
        eq(assignments.driverId, user.id),
        eq(assignments.routeType, 'roads')
      )
    )

  // Get route details and manager info for each assignment
  const assignmentsWithDetails = await Promise.all(
    myAssignments.map(async (a) => {
      const routeResult = await db
        .select()
        .from(routes)
        .where(eq(routes.id, a.routeId as any))
      const route = routeResult[0] || null

      const managerResult = await db
        .select()
        .from(users)
        .where(eq(users.id, a.managerId!))
      const manager = managerResult[0] || null

      return { ...a, route, manager }
    })
  )

  const currentDriver = driverProfile[0]

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-100 p-6">
      <DriverLocationTracker />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Road Driver Dashboard</h1>
        <p className="text-gray-600 mb-8">
          View your assigned delivery tasks and mark them as complete.
        </p>

        {/* Current Location Card and Profile */}
        {currentDriver && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Location Card */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border border-blue-200">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">Your Current Location</h2>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Latitude</p>
                  <p className="text-2xl font-bold text-blue-600">{currentDriver.lat.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Longitude</p>
                  <p className="text-2xl font-bold text-blue-600">{currentDriver.lon.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-4">
                Last updated: {currentDriver.updatedAt ? new Date(currentDriver.updatedAt).toLocaleString() : 'N/A'}
              </p>
            </div>

            {/* Profile Update Card */}
            <DriverProfileUpdate
              currentCapacity={currentDriver.capacity}
              currentLat={currentDriver.lat}
              currentLon={currentDriver.lon}
            />
          </div>
        )}

        {assignmentsWithDetails.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No assignments yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignmentsWithDetails.map((item) => (
              <DriverAssignmentCard
                key={item.id}
                assignment={item}
                route={item.route}
                manager={item.manager}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}