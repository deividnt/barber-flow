import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({}, { status: 401 })

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: session.user.barbershopId },
  })

  return NextResponse.json(barbershop ?? {})
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const { name, phone, email, address } = data

  const barbershop = await prisma.barbershop.update({
    where: { id: session.user.barbershopId },
    data: {
      name: name || undefined,
      phone: phone || null,
      email: email || null,
      address: address || null,
    },
  })

  return NextResponse.json(barbershop)
}
