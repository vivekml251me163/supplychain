import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/index'
import { assignments, ships, roads, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import WorkDoneButton from '@/components/WorkDoneButton'
import Link from 'next/link'

export default async function DriverPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'driver') redirect('/')
  if (!user?.isVerified) redirect('/')

  // get all assignments for this driver
  const myAssignments = await db
    .select()
    .from(assignments)
    .where(eq(assignments.driverId, user.id))

  // get route details for each assignment
  const assignmentsWithRoutes = await Promise.all(
    myAssignments.map(async a => {
      let route = null
      if (a.routeType === 'ships' && a.routeId) {
        const result = await db
          .select()
          .from(ships)
          .where(eq(ships.id, a.routeId))
        route = result[0] || null
      } else if (a.routeType === 'roads' && a.routeId) {
        const result = await db
          .select()
          .from(roads)
          .where(eq(roads.id, a.routeId))
        route = result[0] || null
      }

      // get manager info
      const managerResult = await db
        .select()
        .from(users)
        .where(eq(users.id, a.managerId!))
      const manager = managerResult[0] || null

      return { ...a, route, manager }
    })
  )

  const pending = assignmentsWithRoutes.filter(a => !a.workDone)
  const completed = assignmentsWithRoutes.filter(a => a.workDone)

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-8">
      <h1 className="text-2xl font-semibold text-gray-800">My Routes</h1>
      <p className="mt-1 text-sm text-gray-500 mb-8">
        Location: <span className="font-medium text-gray-700">{user?.location}</span>
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-500 mb-1">Total Assigned</p>
          <p className="text-2xl font-semibold text-blue-700">
            {assignmentsWithRoutes.length}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <p className="text-xs text-yellow-500 mb-1">Pending</p>
          <p className="text-2xl font-semibold text-yellow-700">{pending.length}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs text-green-500 mb-1">Completed</p>
          <p className="text-2xl font-semibold text-green-700">{completed.length}</p>
        </div>
      </div>

      {/* Pending assignments */}
      <div className="mb-10">
        <h2 className="text-lg font-medium text-gray-700 mb-4">
          Pending Routes
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400">No pending routes — all done! 🎉</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map(a => (
              <div
                key={a.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {(a.route as any)?.origin?.name} →{' '}
                      {(a.route as any)?.destination?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Type: {a.routeType === 'ships' ? '🚢 Ship' : '🚛 Road'} · Assigned
                      by: {a.manager?.name || 'Manager'} ·{' '}
                      {new Date(a.assignedAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                      Pending
                    </span>
                    <WorkDoneButton
                      assignmentId={a.id}
                      workDone={a.workDone ?? false}
                    />
                  </div>
                </div>

                {/* Reasons why route changed */}
                {(a.route as any)?.reasons && (
                  <div className="mt-2 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                    <p className="text-xs font-medium text-yellow-700 mb-1">
                      ⚠️ Why route changed
                    </p>
                    {((a.route as any).reasons as any[]).map(
                      (r: any, i: number) => (
                        <p key={i} className="text-xs text-yellow-600">
                          • {r.description || r}
                        </p>
                      )
                    )}
                  </div>
                )}

                {/* <div className="mt-3">
                  <Link
                    href={`/driver/route/${a.id}`}
                    className="text-xs border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                  >
                    View on map →
                  </Link>
                </div> */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed assignments */}
      <div className="mb-10">
        <h2 className="text-lg font-medium text-gray-700 mb-4">
          Completed Routes
        </h2>
        {completed.length === 0 ? (
          <p className="text-sm text-gray-400">No completed routes yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {completed.map(a => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 opacity-75"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {(a.route as any)?.origin?.name} →{' '}
                    {(a.route as any)?.destination?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Type: {a.routeType === 'ships' ? '🚢 Ship' : '🚛 Road'} ·
                    Assigned by: {a.manager?.name || 'Manager'} ·{' '}
                    {new Date(a.assignedAt!).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    ✓ Completed
                  </span>
                  <WorkDoneButton
                    assignmentId={a.id}
                    workDone={a.workDone ?? false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}