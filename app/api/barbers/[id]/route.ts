import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const barber = await prisma.barber.findFirst({
    where: { id: params.id, barbershopId: session.user.barbershopId },
  })
  if (!barber)
    return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 })

  const { name, email, phone, specialty } = await req.json()

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: barber.userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone: phone || null }),
      },
    })
    await tx.barber.update({
      where: { id: params.id },
      data: { ...(specialty !== undefined && { specialty: specialty || null }) },
    })
  })

  const updated = await prisma.barber.findUnique({
    where: { id: params.id },
    include: { user: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const barber = await prisma.barber.findFirst({
    where: { id: params.id, barbershopId: session.user.barbershopId },
  })
  if (!barber)
    return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 })

  // Deleta o User (Barber é deletado em cascata pelo schema)
  await prisma.user.delete({ where: { id: barber.userId } })

  return NextResponse.json({ ok: true })
}
