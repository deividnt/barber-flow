import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const schedules = await (prisma as any).barberSchedule.findMany({
      where: { barberId: params.id },
      orderBy: { dayOfWeek: 'asc' },
    })
    return NextResponse.json(schedules)
  } catch {
    return NextResponse.json([])
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { schedules } = await req.json()

  await Promise.all(schedules.map((s: any) =>
    (prisma as any).barberSchedule.upsert({
      where: { barberId_dayOfWeek: { barberId: params.id, dayOfWeek: s.dayOfWeek } },
      create: { barberId: params.id, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, active: s.active },
      update: { startTime: s.startTime, endTime: s.endTime, active: s.active },
    })
  ))

  return NextResponse.json({ ok: true })
}
