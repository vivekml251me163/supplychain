import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, managerType } = await req.json()

  // Only allow setting managerType for managers
  const targetUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))

  if (!targetUser || targetUser.length === 0 || targetUser[0].role !== 'manager') {
    return NextResponse.json(
      { error: 'Can only set managerType for users with manager role' },
      { status: 400 }
    )
  }

  // Validate managerType
  if (!['ship', 'road'].includes(managerType)) {
    return NextResponse.json(
      { error: 'managerType must be either "ship" or "road"' },
      { status: 400 }
    )
  }

  await db
    .update(users)
    .set({ managerType })
    .where(eq(users.id, userId))

  return NextResponse.json({ message: 'Manager type updated successfully' })
}
