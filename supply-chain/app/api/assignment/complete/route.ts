import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { assignments } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assignmentId } = await req.json()

    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId is required' }, { status: 400 })
    }

    // Get the assignment
    const assignmentResult = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, assignmentId as any))

    if (!assignmentResult.length) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const assignment = assignmentResult[0]

    // Check if user is the manager or driver for this assignment
    if (user.id !== assignment.managerId && user.id !== assignment.driverId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Mark assignment as complete
    const updatedAssignment = await db
      .update(assignments)
      .set({
        workDone: true,
        completedAt: new Date().toISOString(),
      })
      .where(eq(assignments.id, assignmentId as any))
      .returning()

    return NextResponse.json({
      message: 'Assignment marked as complete',
      assignment: updatedAssignment[0],
    })
  } catch (error) {
    console.error('[Complete Assignment] Error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      {
        error: 'Failed to complete assignment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
