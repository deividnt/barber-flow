import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findFirst({
    where: { id: params.id, barbershopId: session.user.barbershopId },
  })
  if (!product)
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })

  const { name, category, unit, costPrice, salePrice, minStock } = await req.json()

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(category !== undefined && { category: category || null }),
      ...(unit && { unit }),
      ...(costPrice !== undefined && { costPrice: parseFloat(costPrice) }),
      ...(salePrice !== undefined && { salePrice: parseFloat(salePrice) }),
      ...(minStock !== undefined && { minStock: parseFloat(minStock) }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findFirst({
    where: { id: params.id, barbershopId: session.user.barbershopId },
  })
  if (!product)
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })

  await prisma.product.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
