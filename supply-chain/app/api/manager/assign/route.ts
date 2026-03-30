import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { assignments } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { driverId, routeType, routeId } = await req.json()

  await db.insert(assignments).values({
    managerId: user.id,
    driverId,
    routeType,
    routeId,
    workDone: false,
  })

  return NextResponse.json({ message: 'Assigned successfully' })
}