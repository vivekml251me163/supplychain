import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../db/index'
import { users } from '../../../db/schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json()

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
    role: role || 'driver',
    managerType: null,
    isVerified: false,
  })

  return NextResponse.json({ message: 'User created successfully' })
}