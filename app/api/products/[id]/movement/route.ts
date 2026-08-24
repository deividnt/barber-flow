import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, qty, reason } = await req.json()
  if (!type || !qty) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })

  const product = await prisma.product.findUnique({ where: { id: params.id } })
  if (!product) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })

  const delta = type === 'IN' ? Number(qty) : type === 'OUT' ? -Number(qty) : Number(qty)

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        productId: params.id,
        barbershopId: session.user.barbershopId,
        type,
        qty: Number(qty),
        reason: reason || null,
      },
    }),
    prisma.product.update({
      where: { id: params.id },
      data: { stockQty: { increment: delta } },
    }),
  ])

  return NextResponse.json({ ok: true })
}
