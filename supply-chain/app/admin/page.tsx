import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/index'
import { users, ships, roads } from '@/db/schema'
import { ne } from 'drizzle-orm'
import VerifyButton from '@/components/VerifyButton'
import DeleteButton from '@/components/DeleteButton'
import RoleSelector from '@/components/RoleSelector'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'admin') {
    redirect('/')
  }

  const allUsers = await db
    .select()
    .from(users)
    .where(ne(users.role, 'admin'))

  const allShips = await db.select().from(ships)
  const allRoads = await db.select().from(roads)

  const managers = allUsers.filter(u => u.role === 'manager')
  const drivers = allUsers.filter(u => u.role === 'driver')

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-8">

      <h1 className="text-2xl font-semibold text-gray-800">Admin Panel</h1>
      <p className="mt-1 text-sm text-gray-500 mb-8">
        Manage users, verify access, and view all routes
      </p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-xs text-purple-500 mb-1">Total Managers</p>
          <p className="text-2xl font-semibold text-purple-700">{managers.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-500 mb-1">Total Drivers</p>
          <p className="text-2xl font-semibold text-blue-700">{drivers.length}</p>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
          <p className="text-xs text-teal-500 mb-1">Ship Routes</p>
          <p className="text-2xl font-semibold text-teal-700">{allShips.length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
          <p className="text-xs text-orange-500 mb-1">Road Routes</p>
          <p className="text-2xl font-semibold text-orange-700">{allRoads.length}</p>
        </div>
      </div>

      {/* Managers */}
      <div className="mb-10">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Managers</h2>
        {managers.length === 0 ? (
          <p className="text-sm text-gray-400">No managers registered yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {managers.map(u => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Location: {u.location || 'Not set'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {u.isVerified ? (
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                  <RoleSelector userId={u.id} currentRole={u.role ?? 'driver'} />
                  <VerifyButton userId={u.id} isVerified={u.isVerified ?? false} />
                  <DeleteButton userId={u.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drivers */}
      <div className="mb-10">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Drivers</h2>
        {drivers.length === 0 ? (
          <p className="text-sm text-gray-400">No drivers registered yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {drivers.map(u => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Location: {u.location || 'Not set'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {u.isVerified ? (
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                  <RoleSelector userId={u.id} currentRole={u.role ?? 'driver'} />
                  <VerifyButton userId={u.id} isVerified={u.isVerified ?? false} />
                  <DeleteButton userId={u.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Routes */}
      <div className="mb-10">
        <h2 className="text-lg font-medium text-gray-700 mb-4">All Ship Routes</h2>
        {allShips.length === 0 ? (
          <p className="text-sm text-gray-400">No ship routes yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {allShips.map((s: any) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {s.origin?.name} → {s.destination?.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Created: {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href="/ships"
                  className="text-xs border border-teal-200 text-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-50"
                >
                  View on map
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-medium text-gray-700 mb-4">All Road Routes</h2>
        {allRoads.length === 0 ? (
          <p className="text-sm text-gray-400">No road routes yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {allRoads.map((r: any) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {r.origin?.name} → {r.destination?.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Status: {r.status} · Created: {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href="/roads"
                  className="text-xs border border-orange-200 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50"
                >
                  View on map
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  )
}