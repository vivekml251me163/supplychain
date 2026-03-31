import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { users, drivers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'driver') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user details
  const userDetails = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))

  if (userDetails.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Get driver profile
  const driverProfile = await db
    .select()
    .from(drivers)
    .where(eq(drivers.userId, user.id))

  if (driverProfile.length === 0) {
    return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
  }

  return NextResponse.json({
    user: userDetails[0],
    driver: driverProfile[0],
  })
}
