import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json([], { status: 401 })

  const products = await prisma.product.findMany({
    where: { barbershopId: session.user.barbershopId, active: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, category, unit, costPrice, salePrice, stockQty, minStock } = await req.json()
  if (!name) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

  const product = await prisma.product.create({
    data: {
      barbershopId: session.user.barbershopId,
      name,
      category: category || null,
      unit: unit || 'UN',
      costPrice: Number(costPrice) || 0,
      salePrice: Number(salePrice) || 0,
      stockQty: Number(stockQty) || 0,
      minStock: Number(minStock) || 0,
    },
  })

  return NextResponse.json(product, { status: 201 })
}
