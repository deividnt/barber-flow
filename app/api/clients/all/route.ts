import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const barbershopId = session.user.barbershopId

  // Exclui agendamentos e depois clientes
  await prisma.appointment.deleteMany({ where: { barbershopId } })
  const { count } = await prisma.client.deleteMany({ where: { barbershopId } })

  return NextResponse.json({ ok: true, deleted: count })
}
