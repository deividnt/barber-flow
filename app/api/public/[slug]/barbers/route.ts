import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const barbershop = await prisma.barbershop.findUnique({ where: { slug: params.slug } })
  if (!barbershop) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })

  const barbers = await prisma.barber.findMany({
    where: { barbershopId: barbershop.id, active: true },
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: 'asc' } },
  })

  // Busca schedules separado (após prisma generate estará disponível no include)
  const barbersWithSchedules = await Promise.all(
    barbers.map(async (b) => {
      try {
        const schedules = await (prisma as any).barberSchedule.findMany({
          where: { barberId: b.id, active: true },
          orderBy: { dayOfWeek: 'asc' },
        })
        return { ...b, schedules }
      } catch {
        return { ...b, schedules: [] }
      }
    })
  )

  return NextResponse.json(barbersWithSchedules)
}
