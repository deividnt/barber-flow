import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const barbershop = await prisma.barbershop.findUnique({ where: { slug: params.slug } })
  if (!barbershop) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })

  const services = await prisma.service.findMany({
    where: { barbershopId: barbershop.id, active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, price: true, durationMin: true, description: true },
  })
  return NextResponse.json(services)
}
