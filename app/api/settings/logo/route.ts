import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('logo') as File | null

  if (!file)
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

  // Aceita apenas imagens
  if (!file.type.startsWith('image/'))
    return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })

  // Limite de 2MB
  if (file.size > 2 * 1024 * 1024)
    return NextResponse.json({ error: 'Imagem muito grande (máx 2MB)' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const filename = `logo-${session.user.barbershopId}.${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  const filepath = join(uploadDir, filename)

  await mkdir(uploadDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)

  const logoUrl = `/uploads/${filename}`

  await prisma.barbershop.update({
    where: { id: session.user.barbershopId },
    data: { logo: logoUrl },
  })

  return NextResponse.json({ logoUrl })
}
