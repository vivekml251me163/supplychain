import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/db/index'
import { ships } from '@/db/schema'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  // Only allow manager_ship role
  if (!session || user?.role !== 'manager_ship') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch all ships
    const allShips = await db.select().from(ships)

    return NextResponse.json({
      ships: allShips.map((ship) => ({
        id: ship.id,
        userId: ship.userId,
        origin: ship.origin,
        destination: ship.destination,
        originalRoute: ship.originalRoute,
        bestRoute: ship.bestRoute,
        reasons: ship.reasons,
        weatherData: ship.weatherData,
        newsData: ship.newsData,
        createdAt: ship.createdAt,
        refreshedAt: ship.refreshedAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching ships:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ships' },
      { status: 500 }
    )
  }
}
