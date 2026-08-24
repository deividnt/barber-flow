import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json([], { status: 401 })

  const transactions = await prisma.financialTransaction.findMany({
    where: { barbershopId: session.user.barbershopId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json(transactions)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, category, description, amount, date } = await req.json()

  if (!type || !description || !amount) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const transaction = await prisma.financialTransaction.create({
    data: {
      barbershopId: session.user.barbershopId,
      type,
      category: category || null,
      description,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
    },
  })

  return NextResponse.json(transaction, { status: 201 })
}
