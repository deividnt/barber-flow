import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json([], { status: 401 })

  const clients = await prisma.client.findMany({
    where: { barbershopId: session.user.barbershopId },
    include: { _count: { select: { appointments: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(clients)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, phone, email, birthDate, notes } = await req.json()
  if (!name) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

  const client = await prisma.client.create({
    data: {
      barbershopId: session.user.barbershopId,
      name,
      phone: phone || null,
      email: email || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      notes: notes || null,
    },
  })

  return NextResponse.json(client, { status: 201 })
}
