import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { slugify } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const { name, email, password, barbershopName } = await req.json()

    if (!name || !email || !password || !barbershopName) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })

    const hash = await bcrypt.hash(password, 12)

    const slug = slugify(barbershopName)

    const result = await prisma.$transaction(async (tx) => {
      const barbershop = await tx.barbershop.create({
        data: { name: barbershopName, slug },
      })
      const user = await tx.user.create({
        data: { name, email, password: hash, role: 'ADMIN' },
      })
      await tx.barber.create({
        data: { userId: user.id, barbershopId: barbershop.id },
      })
      await tx.retentionConfig.create({
        data: { barbershopId: barbershop.id },
      })
      return { user, barbershop }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
