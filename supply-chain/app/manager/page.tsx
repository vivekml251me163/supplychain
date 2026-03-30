import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/index'
import { users, ships, roads, assignments } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import AssignButton from '@/components/AssignButton'
import Link from 'next/link'

export default async function ManagerPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'manager') redirect('/')
  if (!user?.isVerified) redirect('/')

  const location = user?.location

  // get all drivers in same region
  const regionDrivers = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.role, 'driver'),
        eq(users.location, location),
        eq(users.isVerified, true)
      )
    )

  // get all assignments made by this manager
  const myAssignments = await db
    .select()
    .from(assignments)
    .where(eq(assignments.managerId, user.id))

  // get all ships and roads for assigning
  const allShips = await db.select().from(ships)
  const allRoads = await db.select().from(roads)

  // build route list for assign button
  const routes = [
    ...allShips.map((s: any) => ({
      id: s.id,
      label: `${s.origin?.name} → ${s.destination?.name}`,
      type: 'ships' as const,
    })),
    ...allRoads.map((r: any) => ({
      id: r.id,
      label: `${r.origin?.name} → ${r.destination?.name}`,
      type: 'roads' as const,
    })),
  ]

  const driverList = regionDrivers.map(d => ({
    id: d.id,
    name: d.name,
  }))

  const completedAssignments = myAssignments.filter(a => a.workDone).length

  return (
    <main className="min-h-screen bg-gray-50">
      

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Dashboard Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-emerald-600 mb-2">Operations Overview</p>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Manager Command Center</h2>
            <p className="text-gray-600 text-sm mt-2">Region: <span className="font-semibold text-gray-900">{location}</span></p>
          </div>
          
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-5 shadow-sm">
            <div className="h-14 w-14 rounded-lg bg-emerald-100 flex items-center justify-center text-2xl">🚗</div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Drivers in Region</p>
              <p className="text-3xl font-bold text-gray-900">{regionDrivers.length}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-5 shadow-sm">
            <div className="h-14 w-14 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">📋</div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Assignments</p>
              <p className="text-3xl font-bold text-gray-900">{myAssignments.length}</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-5 shadow-sm">
            <div className="h-14 w-14 rounded-lg bg-emerald-100 flex items-center justify-center text-2xl">✓</div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed Assignments</p>
              <p className="text-3xl font-bold text-gray-900">{completedAssignments}</p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Tables */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Regional Drivers Table */}
            <section className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <div className="px-6 py-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Regional Drivers</h3>
                <span className="text-xs font-bold text-gray-600 tracking-widest uppercase">Active Fleet</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-600 font-bold">
                    <tr>
                      <th className="px-6 py-4">Driver Name</th>
                      <th className="px-6 py-4">Contact Email</th>
                      <th className="px-6 py-4 text-center">Assignments</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {regionDrivers.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No verified drivers in your region yet</td></tr>
                    ) : (
                      regionDrivers.map(d => {
                        const driverAssignments = myAssignments.filter(a => a.driverId === d.id)
                        const isCompleted = driverAssignments.length > 0 && driverAssignments.every(a => a.workDone)
                        return (
                          <tr key={d.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                                {d.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-900">{d.name}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{d.email || 'N/A'}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="bg-gray-100 text-gray-900 text-xs font-bold px-2 py-1 rounded">
                                {driverAssignments.length}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-gray-400' : 'bg-emerald-500 animate-pulse'}`}></span>
                                <span className={`text-xs font-bold ${isCompleted ? 'text-gray-600' : 'text-emerald-600'}`}>
                                  {isCompleted ? 'Completed' : 'On Route'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* All Assignments Table */}
            <section className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <div className="px-6 py-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">All Assignments</h3>
                <span className="bg-gray-900 text-white text-xs font-black uppercase px-2 py-1 rounded">Live Feed</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-600 font-bold">
                    <tr>
                      <th className="px-6 py-4">Driver</th>
                      <th className="px-6 py-4">Route Type</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {myAssignments.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No assignments made yet</td></tr>
                    ) : (
                      myAssignments.map(a => {
                        const driver = regionDrivers.find(d => d.id === a.driverId)
                        return (
                          <tr key={a.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{driver?.name || 'Unknown'}</td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                ⚡ {a.routeType === 'ships' ? 'Ship Route' : 'Road Route'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-600">{new Date(a.assignedAt!).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-bold px-2 py-1 rounded border ${a.workDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                {a.workDone ? '✓ COMPLETED' : 'PENDING'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link href={`/${a.routeType}`} className="text-emerald-600 text-sm font-bold hover:underline">
                                View Route
                              </Link>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

          </div>

          {/* Right Column: Forms & Cards */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Assign Route Section */}
            <section className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                📍 Assign Route
              </h3>
              <AssignButton drivers={driverList} routes={routes} />
            </section>

            

           

          </div>

        </div>
      </div>

      

    </main>
  )
}