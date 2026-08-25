import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('logo') as File | null

  if (!file)
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

  if (!file.type.startsWith('image/'))
    return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })

  if (file.size > 2 * 1024 * 1024)
    return NextResponse.json({ error: 'Imagem muito grande (máx 2MB)' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

  await prisma.barbershop.update({
    where: { id: session.user.barbershopId },
    data: { logo: base64 },
  })

  return NextResponse.json({ logoUrl: base64 })
}
