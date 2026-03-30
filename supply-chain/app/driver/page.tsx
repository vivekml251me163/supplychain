import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/index'
import { assignments, roads, users } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import WorkDoneButton from '@/components/WorkDoneButton'
import RouteMapClient from '@/components/RouteMapClient'
import Link from 'next/link'

export default async function DriverPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'driver') redirect('/')
  if (!user?.isVerified) redirect('/')

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
      const roadResult = await db
        .select()
        .from(roads)
        .where(eq(roads.id, a.routeId))
      const road = roadResult[0] || null

      const managerResult = await db
        .select()
        .from(users)
        .where(eq(users.id, a.managerId!))
      const manager = managerResult[0] || null

      return { ...a, road, manager }
    })
  )

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Road Driver Dashboard</h1>
        <p className="text-gray-600 mb-8">
          View your assigned delivery tasks and mark them as complete.
        </p>

        {assignmentsWithDetails.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No assignments yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignmentsWithDetails.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {(assignment.road as any)?.origin?.name || 'Pickup'} →{' '}
                        {(assignment.road as any)?.destination?.name || 'Delivery'}
                      </h2>
                      <p className="text-gray-600">
                        Manager: <span className="font-medium">{assignment.manager?.name || 'N/A'}</span>
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        assignment.workDone
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {assignment.workDone ? '✓ Completed' : 'In Progress'}
                    </span>
                  </div>

                  {/* Coordinates Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Pickup Location</p>
                      <p className="text-gray-900 font-semibold">
                        {(assignment.road as any)?.origin?.lat?.toFixed(4)},{' '}
                        {(assignment.road as any)?.origin?.lng?.toFixed(4)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Delivery Location</p>
                      <p className="text-gray-900 font-semibold">
                        {(assignment.road as any)?.destination?.lat?.toFixed(4)},{' '}
                        {(assignment.road as any)?.destination?.lng?.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  {/* Route Info */}
                  {(assignment.road as any)?.bestRoute && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-blue-900">
                        <strong>Route Distance:</strong> {(assignment.road as any).bestRoute.distance_km?.toFixed(2)} km |
                        <strong className="ml-3">Duration:</strong>{' '}
                        {(assignment.road as any).bestRoute.duration_hrs?.toFixed(1)} hours
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Assigned: {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : 'N/A'}{' '}
                    {assignment.completedAt &&
                      `| Completed: ${new Date(assignment.completedAt).toLocaleDateString()}`}
                  </p>
                </div>

                {/* Route Map */}
                {(assignment.road as any)?.bestRoute && (
                  <div className="bg-gray-50 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Assigned Route</h3>
                    <RouteMapClient
                      originalRoute={(assignment.road as any).originalRoute?.waypoints || []}
                      bestRoute={(assignment.road as any).bestRoute?.waypoints || []}
                      reasons={(assignment.road as any).reasons?.map((r: any) => r.description) || []}
                    />
                  </div>
                )}

                {/* Mark as Done Button */}
                {!assignment.workDone && (
                  <div className="bg-gray-50 p-6 border-t border-gray-200">
                    <WorkDoneButton assignmentId={assignment.id} workDone={assignment.workDone || false} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}