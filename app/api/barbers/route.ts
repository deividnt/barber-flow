import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json([], { status: 401 })

  const barbers = await prisma.barber.findMany({
    where: { barbershopId: session.user.barbershopId, active: true },
    include: { user: true },
    orderBy: { user: { name: 'asc' } },
  })

  return NextResponse.json(barbers)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, email, password, specialty, phone } = await req.json()
  if (!name || !email || !password)
    return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing)
    return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })

  const bcrypt = await import('bcryptjs')
  const hash = await bcrypt.hash(password, 12)

  const barbershopId = session.user.barbershopId

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hash,
        role: 'BARBER',
        phone: phone || undefined,
      },
    })
    const barber = await tx.barber.create({
      data: {
        userId: user.id,
        barbershopId,
        specialty: specialty || undefined,
      },
    })
    return { user, barber }
  })

  return NextResponse.json(result, { status: 201 })
}
