import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const barbershop = await prisma.barbershop.findUnique({ where: { slug: params.slug } })
  if (!barbershop) return NextResponse.json({ error: 'Nao encontrada' }, { status: 404 })

  const { clientName, clientPhone, barberId, serviceId, date, time } = await req.json()

  if (!clientName || !barberId || !serviceId || !date || !time)
    return NextResponse.json({ error: 'Campos obrigatorios faltando' }, { status: 400 })

  const [h, m] = time.split(':').map(Number)
  const scheduledAt = new Date(date + 'T00:00:00')
  scheduledAt.setHours(h, m, 0, 0)

  const conflict = await prisma.appointment.findFirst({
    where: { barberId, scheduledAt, status: { in: ['PENDING', 'CONFIRMED'] } },
  })
  if (conflict) return NextResponse.json({ error: 'Horario nao disponivel' }, { status: 409 })

  let client = clientPhone
    ? await prisma.client.findFirst({ where: { phone: clientPhone, barbershopId: barbershop.id } })
    : null

  if (!client) {
    client = await prisma.client.create({
      data: { barbershopId: barbershop.id, name: clientName, phone: clientPhone || null },
    })
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  const durationMin = service?.durationMin ?? 30
  const endsAt = new Date(scheduledAt.getTime() + durationMin * 60 * 1000)

  const appointment = await prisma.appointment.create({
    data: {
      barbershopId: barbershop.id,
      barberId,
      clientId: client.id,
      serviceId,
      scheduledAt,
      endsAt,
      status: 'PENDING',
      notes: 'Agendamento online',
    },
  })

  return NextResponse.json({ ok: true, appointmentId: appointment.id }, { status: 201 })
}
