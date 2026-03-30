import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/index'
import { assignments, users, roads } from '@/db/schema'
import { eq } from 'drizzle-orm'
import RoadAssignmentForm from '@/components/RoadAssignmentForm'

export default async function RoadManagerPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'manager' || user?.managerType !== 'road') {
    redirect('/')
  }
  if (!user?.isVerified) {
    redirect('/')
  }

  // Get all verified drivers (no location filtering)
  const allDrivers = await db
    .select()
    .from(users)
    .where(eq(users.role, 'driver'))

  const verifiedDrivers = allDrivers.filter((d: any) => d.isVerified)

  // Get all assignments made by this manager
  const myAssignments = await db
    .select()
    .from(assignments)
    .where(eq(assignments.managerId, user.id))

  // Filter for road assignments only and fetch route details
  const roadAssignments = await Promise.all(
    myAssignments
      .filter((a: any) => a.routeType === 'roads')
      .map(async (a: any) => {
        const roadResult = await db
          .select()
          .from(roads)
          .where(eq(roads.id, a.routeId))
        const road = roadResult[0] || null

        const driverResult = await db
          .select()
          .from(users)
          .where(eq(users.id, a.driverId))
        const driver = driverResult[0] || null

        return { ...a, road, driver }
      })
  )

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Road Manager</h1>
        <p className="text-gray-600 mb-8">
          Create delivery tasks and assign them to drivers. The system will calculate the optimal route.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Form */}
          <div className="lg:col-span-1">
            <RoadAssignmentForm drivers={verifiedDrivers} />
          </div>

          {/* Assignments List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Assignments</h2>

              {roadAssignments.length === 0 ? (
                <p className="text-gray-500">No assignments created yet.</p>
              ) : (
                <div className="space-y-4">
                  {roadAssignments.map((assignment: any) => (
                    <div
                      key={assignment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {assignment.road?.origin?.name || 'Pickup'} →{' '}
                            {assignment.road?.destination?.name || 'Delivery'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Driver: <span className="font-medium">{assignment.driver?.name || 'N/A'}</span>
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            assignment.workDone
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {assignment.workDone ? 'Completed' : 'In Progress'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <div>
                          <p className="text-gray-500">Pickup</p>
                          <p>
                            {assignment.road?.origin?.lat?.toFixed(4)},{' '}
                            {assignment.road?.origin?.lng?.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Delivery</p>
                          <p>
                            {assignment.road?.destination?.lat?.toFixed(4)},{' '}
                            {assignment.road?.destination?.lng?.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      {assignment.road?.bestRoute && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            Distance: {assignment.road.bestRoute.distance_km?.toFixed(2)} km
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-2">
                        Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
