import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { assignments, drivers, roads } from '@/db/schema'
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
    .where(eq(assignments.id, assignmentId))

  if (assignment.length === 0) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  // If marking as complete, get destination coordinates and update driver location
  if (workDone && assignment[0].routeType === 'roads') {
    const route = await db
      .select()
      .from(roads)
      .where(eq(roads.id, assignment[0].routeId))

    if (route.length > 0) {
      const destination = (route[0].destination as any)
      const destLat = destination?.lat
      const destLon = destination?.lng

      // Update driver's location to destination
      if (typeof destLat === 'number' && typeof destLon === 'number') {
        await db
          .update(drivers)
          .set({ lat: destLat, lon: destLon, updatedAt: new Date() })
          .where(eq(drivers.userId, user.id))
      }
    }
  }

  await db
    .update(assignments)
    .set({ workDone, completedAt: workDone ? new Date() : null })
    .where(eq(assignments.id, assignmentId))

  return NextResponse.json({ message: 'Updated successfully' })
}