import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json([], { status: 401 })

  const sales = await prisma.sale.findMany({
    where: { barbershopId: session.user.barbershopId },
    include: { client: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(sales)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clientId, paymentMethod, items } = await req.json()

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Itens obrigatórios' }, { status: 400 })
  }

  const total = items.reduce((sum: number, item: any) => sum + item.unitPrice * item.qty, 0)

  const sale = await prisma.$transaction(async (tx) => {
    const s = await tx.sale.create({
      data: {
        barbershopId: session.user.barbershopId!,
        clientId: clientId || null,
        paymentMethod: paymentMethod || 'CASH',
        total,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice,
            total: item.unitPrice * item.qty,
          })),
        },
      },
    })

    // Deduct stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.qty } },
      })
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          barbershopId: session.user.barbershopId!,
          type: 'SALE',
          qty: item.qty,
          reason: `Venda #${s.id.slice(-6)}`,
        },
      })
    }

    // Financial record
    await tx.financialTransaction.create({
      data: {
        barbershopId: session.user.barbershopId!,
        type: 'INCOME',
        description: `Venda de produtos`,
        amount: total,
        category: 'Vendas',
      },
    })

    return s
  })

  return NextResponse.json(sale, { status: 201 })
}
