import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(req.url)
  const barberId = searchParams.get('barberId')
  const date = searchParams.get('date')

  if (!barberId || !date)
    return NextResponse.json({ error: 'barberId e date são obrigatórios' }, { status: 400 })

  const barbershop = await prisma.barbershop.findUnique({ where: { slug: params.slug } })
  if (!barbershop) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })

  const dateObj = new Date(date + 'T12:00:00')
  const dayOfWeek = dateObj.getDay()

  let schedule: any = null
  try {
    schedule = await (prisma as any).barberSchedule.findFirst({
      where: { barberId, dayOfWeek, active: true },
    })
  } catch { return NextResponse.json([]) }

  if (!schedule) return NextResponse.json([])

  function timeToMinutes(t: string) {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  function minutesToTime(m: number) {
    const h = Math.floor(m / 60).toString().padStart(2, '0')
    const min = (m % 60).toString().padStart(2, '0')
    return `${h}:${min}`
  }

  const start = timeToMinutes(schedule.startTime)
  const end = timeToMinutes(schedule.endTime)
  const allSlots: string[] = []
  for (let t = start; t < end; t += 30) allSlots.push(minutesToTime(t))

  const dayStart = new Date(date + 'T00:00:00')
  const dayEnd   = new Date(date + 'T23:59:59')

  const booked = await prisma.appointment.findMany({
    where: {
      barberId,
      scheduledAt: { gte: dayStart, lte: dayEnd },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    select: { scheduledAt: true },
  })

  const bookedTimes = new Set(
    booked.map(a => {
      const d = new Date(a.scheduledAt)
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    })
  )

  const now = new Date()
  const isToday = date === now.toISOString().split('T')[0]

  const available = allSlots.filter(slot => {
    if (bookedTimes.has(slot)) return false
    if (isToday) {
      const [h, m] = slot.split(':').map(Number)
      if ((h * 60 + m) <= (now.getHours() * 60 + now.getMinutes())) return false
    }
    return true
  })

  return NextResponse.json(available)
}
