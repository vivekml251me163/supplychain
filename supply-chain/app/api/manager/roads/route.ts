import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { routes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user?.role !== 'manager' || user?.managerType !== 'road') {
      return NextResponse.json({ error: 'Only road managers can create routes' }, { status: 403 })
    }

    const body = await req.json()
    const { srcLat, srcLon, destLat, destLon, goodsAmount } = body

    // Validate required fields
    if (
      typeof srcLat !== 'number' ||
      typeof srcLon !== 'number' ||
      typeof destLat !== 'number' ||
      typeof destLon !== 'number' ||
      typeof goodsAmount !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields. All coordinates and goods amount must be numbers.' },
        { status: 400 }
      )
    }

    // Validate coordinates are reasonable
    if (srcLat < -90 || srcLat > 90 || destLat < -90 || destLat > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90' },
        { status: 400 }
      )
    }

    if (srcLon < -180 || srcLon > 180 || destLon < -180 || destLon > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180' },
        { status: 400 }
      )
    }

    if (goodsAmount <= 0) {
      return NextResponse.json(
        { error: 'Goods amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Create route
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
      {
        error: 'Failed to create route',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user?.role !== 'manager' || user?.managerType !== 'road') {
      return NextResponse.json({ error: 'Only road managers can view routes' }, { status: 403 })
    }

    // Get all routes created by this manager
    const managerRoutes = await db
      .select()
      .from(routes)
      .where(eq(routes.managerId, user.id))

    return NextResponse.json({
      routes: managerRoutes,
    })
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch routes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

