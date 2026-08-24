import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json([], { status: 401 })

  const months: { month: string; receita: number; despesas: number }[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)

    const [income, expense] = await Promise.all([
      prisma.financialTransaction.aggregate({
        where: { barbershopId: session.user.barbershopId, type: 'INCOME', createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: { barbershopId: session.user.barbershopId, type: 'EXPENSE', createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ])

    months.push({
      month: d.toLocaleString('pt-BR', { month: 'short' }),
      receita: income._sum.amount ?? 0,
      despesas: expense._sum.amount ?? 0,
    })
  }

  return NextResponse.json(months)
}
