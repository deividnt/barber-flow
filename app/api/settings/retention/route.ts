import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({}, { status: 401 })

  const config = await prisma.retentionConfig.findFirst({
    where: { barbershopId: session.user.barbershopId },
  })

  return NextResponse.json(config ?? { defaultDays: 30, warningDays: 7 })
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { defaultDays, warningDays } = await req.json()

  const existing = await prisma.retentionConfig.findFirst({
    where: { barbershopId: session.user.barbershopId },
  })

  let config
  if (existing) {
    config = await prisma.retentionConfig.update({
      where: { id: existing.id },
      data: { defaultDays: Number(defaultDays), warningDays: Number(warningDays) },
    })
  } else {
    config = await prisma.retentionConfig.create({
      data: {
        barbershopId: session.user.barbershopId,
        defaultDays: Number(defaultDays),
        warningDays: Number(warningDays),
      },
    })
  }

  return NextResponse.json(config)
}
