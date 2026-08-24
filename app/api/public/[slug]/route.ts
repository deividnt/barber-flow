import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true, slug: true, logo: true, address: true, phone: true, openTime: true, closeTime: true },
  })
  if (!barbershop) return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 })
  return NextResponse.json(barbershop)
}
