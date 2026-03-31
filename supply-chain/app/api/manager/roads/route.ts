import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { routes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    console.log('[Route API] POST request started')
    
    const session = await getServerSession(authOptions)
    console.log('[Route API] Session:', session ? 'exists' : 'no session')
    
    const user = session?.user as any
    console.log('[Route API] User object:', { id: user?.id, role: user?.role, managerType: user?.managerType })

    if (!session) {
      console.log('[Route API] No session')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user?.role !== 'manager' || user?.managerType !== 'road') {
      console.log('[Route API] User is not a road manager')
      return NextResponse.json({ error: 'Only road managers can create routes' }, { status: 403 })
    }

    if (!user?.id) {
      console.log('[Route API] User has no ID')
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 })
    }

    const body = await req.json()
    console.log('[Route API] Request body:', body)
    
    const { srcLat, srcLon, destLat, destLon, goodsAmount } = body

    // Validate required fields
    if (
      typeof srcLat !== 'number' ||
      typeof srcLon !== 'number' ||
      typeof destLat !== 'number' ||
      typeof destLon !== 'number' ||
      typeof goodsAmount !== 'number'
    ) {
      console.log('[Route API] Invalid field types')
      return NextResponse.json(
        { error: 'Missing or invalid required fields. All coordinates and goods amount must be numbers.' },
        { status: 400 }
      )
    }

    // Validate coordinates are reasonable
    if (srcLat < -90 || srcLat > 90 || destLat < -90 || destLat > 90) {
      console.log('[Route API] Invalid latitude')
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90' },
        { status: 400 }
      )
    }

    if (srcLon < -180 || srcLon > 180 || destLon < -180 || destLon > 180) {
      console.log('[Route API] Invalid longitude')
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180' },
        { status: 400 }
      )
    }

    if (goodsAmount <= 0) {
      console.log('[Route API] Invalid goods amount')
      return NextResponse.json(
        { error: 'Goods amount must be greater than 0' },
        { status: 400 }
      )
    }

    console.log('[Route API] Creating route for manager:', user.id)
    
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

    console.log('[Route API] Route created successfully:', result[0].id)

    return NextResponse.json({
      message: 'Route created successfully and awaiting ML assignment',
      route: result[0],
    })
  } catch (error) {
    console.error('[Route API] Error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
    })
    
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

