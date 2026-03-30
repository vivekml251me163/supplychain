import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/index'
import { assignments, ships, roads } from '@/db/schema'
import { eq } from 'drizzle-orm'
import dynamic from 'next/dynamic'
import InfoCards from '@/components/InfoCards'

const RouteMap = dynamic(() => import('@/components/RouteMap'), { ssr: false })
const ShipRouteMap = dynamic(() => import('@/components/ShipRouteMap'), { ssr: false })

export default async function DriverRoutePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'driver') redirect('/')
  if (!user?.isVerified) redirect('/')

  // get assignment by id
  const assignmentResult = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, params.id))

  const assignment = assignmentResult[0]

  if (!assignment) redirect('/driver')

  // make sure this assignment belongs to this driver
  if (assignment.driverId !== user.id) redirect('/driver')

  // get route details
  let route: any = null
  if (assignment.routeType === 'ships' && assignment.routeId) {
    const result = await db
      .select()
      .from(ships)
      .where(eq(ships.id, assignment.routeId))
    route = result[0]
  } else if (assignment.routeType === 'roads' && assignment.routeId) {
    const result = await db
      .select()
      .from(roads)
      .where(eq(roads.id, assignment.routeId))
    route = result[0]
  }

  if (!route) redirect('/driver')

  const originalWaypoints = route.originalRoute?.waypoints || []
  const bestWaypoints = route.bestRoute?.waypoints || []

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-gray-800">
            {route.origin?.name} → {route.destination?.name}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {assignment.routeType === 'ships' ? '🚢 Ship route' : '🚛 Road route'} ·
            Assigned to you
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Distance + time stats */}
          <div className="text-right">
            <p className="text-xs text-gray-500">
              Best route: {route.bestRoute?.distance_km} km ·{' '}
              {route.bestRoute?.duration_hrs} hrs
            </p>
            <p className="text-xs text-gray-400 line-through">
              Original: {route.originalRoute?.distance_km} km ·{' '}
              {route.originalRoute?.duration_hrs} hrs
            </p>
          </div>

          
            href="/driver"
            className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            ← Back
          </a>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        {assignment.routeType === 'ships' ? (
          <ShipRouteMap
            originalRoute={originalWaypoints}
            bestRoute={bestWaypoints}
            reasons={route.reasons || []}
          />
        ) : (
          <RouteMap
            originalRoute={originalWaypoints}
            bestRoute={bestWaypoints}
            reasons={route.reasons || []}
          />
        )}
      </div>

      {/* Info cards */}
      <div className="border-t border-gray-200 bg-white">
        <InfoCards
          reasons={route.reasons || []}
          weatherData={route.weatherData}
          newsData={route.newsData}
          originalRoute={route.originalRoute}
          bestRoute={route.bestRoute}
        />
      </div>

    </div>
  )
}