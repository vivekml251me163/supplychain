import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { assignments, drivers, routes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'driver') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { assignmentId, workDone } = await req.json()

  // Get the assignment to find the route
  const assignment = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, assignmentId as any))

  if (assignment.length === 0) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  // If marking as complete, get destination coordinates and update driver location
  if (workDone && assignment[0].routeType === 'roads') {
    const route = await db
      .select()
      .from(routes)
      .where(eq(routes.id, assignment[0].routeId as any))

    if (route.length > 0) {
      const destLat = route[0].destLat
      const destLon = route[0].destLon

      // Update driver's location to destination
      if (typeof destLat === 'number' && typeof destLon === 'number') {
        await db
          .update(drivers)
          .set({ lat: destLat, lon: destLon, updatedAt: new Date().toISOString() })
          .where(eq(drivers.userId, user.id as any))
      }
    }
  }

  await db
    .update(assignments)
    .set({ workDone, completedAt: workDone ? new Date().toISOString() : null })
    .where(eq(assignments.id, assignmentId as any))

  return NextResponse.json({ message: 'Updated successfully' })
}