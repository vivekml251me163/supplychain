import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { routes, assignments } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { routeId, assignmentId } = await req.json()

  // Validate required fields
  if (!routeId || !assignmentId) {
    return NextResponse.json({ error: 'routeId and assignmentId are required' }, { status: 400 })
  }

  // Verify route exists
  const route = await db
    .select()
    .from(routes)
    .where(eq(routes.id, routeId))

  if (route.length === 0) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 })
  }

  // Verify assignment exists
  const assignment = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, assignmentId))

  if (assignment.length === 0) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  // Update route with assignment
  const result = await db
    .update(routes)
    .set({ assignmentId, updatedAt: new Date() })
    .where(eq(routes.id, routeId))
    .returning()

  return NextResponse.json({
    message: 'Driver assigned to route successfully',
    route: result[0],
  })
}
