import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { assignments, routes } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    // Get session - only ML person can assign
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    // For now, allow any manager to assign (you can add role check later)
    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { routeId, assignments: driverAssignments } = body

    // Validate input
    if (!routeId || !Array.isArray(driverAssignments) || driverAssignments.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid input. Provide routeId and assignments array with driverId and quantity'
      }, { status: 400 })
    }

    // Validate route exists
    const routeResult = await db
      .select()
      .from(routes)
      .where(({ id }) => id === routeId as any)

    if (!routeResult.length) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    }

    const route = routeResult[0]

    // Validate total quantity matches
    const totalAssigned = driverAssignments.reduce((sum: number, a: any) => sum + (a.quantity || 0), 0)
    if (Math.abs(totalAssigned - route.goodsAmount) > 0.01) {
      return NextResponse.json({
        error: `Total assigned quantity (${totalAssigned}) does not match route goods amount (${route.goodsAmount})`,
      }, { status: 400 })
    }

    // Create assignments for each driver
    const createdAssignments = await Promise.all(
      driverAssignments.map((assignment: any) =>
        db
          .insert(assignments)
          .values({
            id: randomUUID() as any,
            managerId: route.managerId,
            driverId: assignment.driverId,
            routeId: routeId,
            routeType: 'roads',
            assignedQuantity: assignment.quantity,
          })
          .returning()
      )
    )

    return NextResponse.json({
      message: `Created ${createdAssignments.length} assignments`,
      assignments: createdAssignments.map(a => a[0]),
    })
  } catch (error) {
    console.error('[ML Assign] Error:', error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      {
        error: 'Failed to create assignments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
