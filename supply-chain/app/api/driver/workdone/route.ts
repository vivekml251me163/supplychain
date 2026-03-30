import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { assignments } from '@/db/schema'
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

  await db
    .update(assignments)
    .set({ workDone })
    .where(eq(assignments.id, assignmentId))

  return NextResponse.json({ message: 'Updated successfully' })
}