import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json([], { status: 401 })

  const appointments = await prisma.appointment.findMany({
    where: { barbershopId: session.user.barbershopId },
    include: {
      client: true,
      service: true,
      barber: { include: { user: true } },
    },
    orderBy: { scheduledAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(appointments)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clientId, serviceId, barberId, scheduledAt } = await req.json()

  if (!clientId || !serviceId || !barberId || !scheduledAt) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })

  const start = new Date(scheduledAt)
  const end = new Date(start.getTime() + service.durationMin * 60000)

  // Conflict detection
  const conflict = await prisma.appointment.findFirst({
    where: {
      barberId,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      AND: [
        { scheduledAt: { lt: end } },
        { endsAt: { gt: start } },
      ],
    },
  })

  if (conflict) {
    return NextResponse.json({ error: 'Horário indisponível para este barbeiro' }, { status: 409 })
  }

  const appointment = await prisma.appointment.create({
    data: {
      barbershopId: session.user.barbershopId,
      clientId,
      serviceId,
      barberId,
      scheduledAt: start,
      endsAt: end,
    },
    include: { client: true, service: true, barber: { include: { user: true } } },
  })

  return NextResponse.json(appointment, { status: 201 })
}
