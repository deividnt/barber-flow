import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Garante que o cliente pertence à barbearia do usuário
  const client = await prisma.client.findFirst({
    where: { id: params.id, barbershopId: session.user.barbershopId },
  })
  if (!client)
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  // Exclui agendamentos relacionados antes de excluir o cliente
  await prisma.appointment.deleteMany({ where: { clientId: params.id } })
  await prisma.client.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await prisma.client.findFirst({
    where: { id: params.id, barbershopId: session.user.barbershopId },
  })
  if (!client)
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const { name, phone, email, birthDate, notes } = await req.json()

  const updated = await prisma.client.update({
    where: { id: params.id },
    data: {
      name: name ?? client.name,
      phone: phone !== undefined ? (phone || null) : client.phone,
      email: email !== undefined ? (email || null) : client.email,
      birthDate: birthDate !== undefined ? (birthDate ? new Date(birthDate) : null) : client.birthDate,
      notes: notes !== undefined ? (notes || null) : client.notes,
    },
  })

  return NextResponse.json(updated)
}
