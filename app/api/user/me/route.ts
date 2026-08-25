import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, currentPassword, newPassword } = await req.json()

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  // Verifica senha atual
  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })

  // Verifica se email já está em uso por outro usuário
  if (email && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Este email já está em uso' }, { status: 400 })
  }

  const data: any = {}
  if (email) data.email = email
  if (newPassword) data.password = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({ where: { id: session.user.id }, data })

  return NextResponse.json({ ok: true })
}
