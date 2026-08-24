import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({}, { status: 401 })

  const barbershopId = session.user.barbershopId

  const [
    totalRevenueAgg,
    totalAppointments,
    activeClients,
    appointments,
    barbers,
  ] = await Promise.all([
    prisma.financialTransaction.aggregate({
      where: { barbershopId, type: 'INCOME' },
      _sum: { amount: true },
    }),
    prisma.appointment.count({ where: { barbershopId, status: 'COMPLETED' } }),
    prisma.client.count({ where: { barbershopId, lastVisitAt: { not: null } } }),
    prisma.appointment.findMany({
      where: { barbershopId, status: 'COMPLETED' },
      include: { service: true, barber: { include: { user: true } } },
    }),
    prisma.barber.findMany({
      where: { barbershopId },
      include: { user: true },
    }),
  ])

  const totalRevenue = totalRevenueAgg._sum.amount ?? 0
  const avgTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0

  // Monthly revenue for last 6 months
  const now = new Date()
  const monthlyRevenue = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    const agg = await prisma.financialTransaction.aggregate({
      where: { barbershopId, type: 'INCOME', createdAt: { gte: start, lte: end } },
      _sum: { amount: true },
    })
    monthlyRevenue.push({
      month: d.toLocaleString('pt-BR', { month: 'short' }),
      receita: agg._sum.amount ?? 0,
    })
  }

  // Top services
  const serviceCount: Record<string, { name: string; count: number }> = {}
  appointments.forEach(a => {
    if (!serviceCount[a.serviceId]) serviceCount[a.serviceId] = { name: a.service.name, count: 0 }
    serviceCount[a.serviceId].count++
  })
  const topServices = Object.values(serviceCount).sort((a, b) => b.count - a.count).slice(0, 5)

  // Barber stats
  const barberStats = barbers.map(b => {
    const barberAppts = appointments.filter(a => a.barberId === b.id)
    const revenue = barberAppts.reduce((s, a) => s + a.service.price, 0)
    return {
      name: b.user.name,
      appointments: barberAppts.length,
      revenue,
      avg: barberAppts.length > 0 ? revenue / barberAppts.length : 0,
    }
  })

  return NextResponse.json({ totalRevenue, totalAppointments, activeClients, avgTicket, monthlyRevenue, topServices, barberStats })
}
