import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { routes, assignments } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'manager' || user?.managerType !== 'road') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { srcLat, srcLon, destLat, destLon, goodsAmount } = await req.json()

  // Validate required fields
  if (typeof srcLat !== 'number' || typeof srcLon !== 'number' ||
      typeof destLat !== 'number' || typeof destLon !== 'number' || typeof goodsAmount !== 'number') {
    return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 })
  }

  // Create route - assignmentId should not be set initially
  try {
    const result = await db
      .insert(routes)
      .values({
        managerId: user.id,
        srcLat,
        srcLon,
        destLat,
        destLon,
        goodsAmount,
      })
      .returning()

    return NextResponse.json({
      message: 'Route created successfully and awaiting ML assignment',
      route: result[0],
    })
  } catch (error) {
    console.error('Error creating route:', error)
    return NextResponse.json(
      { error: 'Failed to create route. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'manager' || user?.managerType !== 'road') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all routes created by this manager
  const managerRoutes = await db
    .select()
    .from(routes)
    .where(eq(routes.managerId, user.id))

  return NextResponse.json({
    routes: managerRoutes,
  })
}

