import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json([], { status: 401 })

  const services = await prisma.service.findMany({
    where: { barbershopId: session.user.barbershopId },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(services)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, price, durationMin } = await req.json()
  if (!name || !price) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })

  const service = await prisma.service.create({
    data: {
      barbershopId: session.user.barbershopId,
      name,
      description: description || null,
      price: Number(price),
      durationMin: Number(durationMin) || 30,
    },
  })

  return NextResponse.json(service, { status: 201 })
}
