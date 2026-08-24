import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await req.json()

  const appointment = await prisma.appointment.update({
    where: { id: params.id },
    data: { status },
  })

  // Update client lastVisitAt when completed
  if (status === 'COMPLETED') {
    await prisma.client.update({
      where: { id: appointment.clientId },
      data: { lastVisitAt: new Date() },
    })
    // Auto-create financial transaction
    const service = await prisma.service.findUnique({ where: { id: appointment.serviceId } })
    if (service) {
      await prisma.financialTransaction.create({
        data: {
          barbershopId: session.user.barbershopId,
          type: 'INCOME',
          description: `Serviço: ${service.name}`,
          amount: service.price,
          category: 'Serviços',
        },
      })
    }
  }

  return NextResponse.json(appointment)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.appointment.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
