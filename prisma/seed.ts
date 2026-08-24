import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Create barbershop
  const barbershop = await prisma.barbershop.upsert({
    where: { slug: 'barbearia-demo' },
    update: {},
    create: {
      name: 'Barbearia Demo',
      slug: 'barbearia-demo',
      phone: '(11) 99999-9999',
      email: 'contato@barbeariademo.com.br',
      address: 'Rua das Flores, 123 - São Paulo, SP',
    },
  })

  console.log('✅ Barbearia criada:', barbershop.name)

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@barberflow.com' },
    update: {},
    create: {
      name: 'Admin Master',
      email: 'admin@barberflow.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create admin barber profile
  await prisma.barber.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      barbershopId: barbershop.id,
      commission: 50,
    },
  })

  console.log('✅ Admin criado: admin@barberflow.com / admin123')

  // Create barber user
  const barberPassword = await bcrypt.hash('barber123', 12)
  const barberUser = await prisma.user.upsert({
    where: { email: 'joao@barberflow.com' },
    update: {},
    create: {
      name: 'João Barbeiro',
      email: 'joao@barberflow.com',
      password: barberPassword,
      role: 'BARBER',
    },
  })

  await prisma.barber.upsert({
    where: { userId: barberUser.id },
    update: {},
    create: {
      userId: barberUser.id,
      barbershopId: barbershop.id,
      commission: 40,
    },
  })

  console.log('✅ Barbeiro criado: joao@barberflow.com / barber123')

  // Create services
  const services = [
    { name: 'Corte Masculino', description: 'Corte clássico com acabamento', price: 35, durationMin: 30 },
    { name: 'Barba', description: 'Aparar e modelar barba com toalha quente', price: 25, durationMin: 20 },
    { name: 'Corte + Barba', description: 'Combo completo corte e barba', price: 55, durationMin: 50 },
    { name: 'Hidratação', description: 'Hidratação capilar profissional', price: 40, durationMin: 40 },
    { name: 'Pigmentação de barba', description: 'Coloração e definição da barba', price: 45, durationMin: 45 },
  ]

  for (const s of services) {
    await prisma.service.create({
      data: { barbershopId: barbershop.id, ...s },
    })
  }

  console.log('✅ Serviços criados:', services.length)

  // Create products
  const products = [
    { name: 'Pomada Modeladora Black', category: 'Pomada', unit: 'UN', costPrice: 15, salePrice: 35, stockQty: 20, minStock: 5 },
    { name: 'Shampoo Anticaspa', category: 'Shampoo', unit: 'UN', costPrice: 12, salePrice: 28, stockQty: 15, minStock: 3 },
    { name: 'Óleo de Barba', category: 'Barba', unit: 'UN', costPrice: 18, salePrice: 42, stockQty: 10, minStock: 3 },
    { name: 'Cerveja Artesanal', category: 'Bebida', unit: 'UN', costPrice: 8, salePrice: 15, stockQty: 30, minStock: 10 },
    { name: 'Água Mineral', category: 'Bebida', unit: 'UN', costPrice: 2, salePrice: 5, stockQty: 50, minStock: 10 },
    { name: 'Gel Fixador', category: 'Gel', unit: 'UN', costPrice: 10, salePrice: 22, stockQty: 2, minStock: 5 },
  ]

  for (const p of products) {
    await prisma.product.create({
      data: { barbershopId: barbershop.id, ...p },
    })
  }

  console.log('✅ Produtos criados:', products.length)

  // Create clients
  const clients = [
    { name: 'Carlos Silva', phone: '(11) 98765-4321', email: 'carlos@email.com', lastVisitAt: new Date(Date.now() - 10 * 86400000) },
    { name: 'Marcos Oliveira', phone: '(11) 91234-5678', email: 'marcos@email.com', lastVisitAt: new Date(Date.now() - 25 * 86400000) },
    { name: 'Rafael Costa', phone: '(11) 99876-5432', lastVisitAt: new Date(Date.now() - 35 * 86400000) },
    { name: 'Bruno Ferreira', phone: '(11) 94567-8901', lastVisitAt: new Date(Date.now() - 45 * 86400000) },
    { name: 'Lucas Mendes', phone: '(11) 92345-6789', lastVisitAt: null },
  ]

  for (const c of clients) {
    await prisma.client.create({
      data: { barbershopId: barbershop.id, ...c },
    })
  }

  console.log('✅ Clientes criados:', clients.length)

  // Retention config
  await prisma.retentionConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      barbershopId: barbershop.id,
      defaultDays: 30,
      warningDays: 7,
    },
  })

  // Financial transactions
  const transactions = [
    { type: 'INCOME', description: 'Serviço: Corte + Barba', amount: 55, category: 'Serviços' },
    { type: 'INCOME', description: 'Serviço: Corte Masculino', amount: 35, category: 'Serviços' },
    { type: 'INCOME', description: 'Venda de produtos', amount: 70, category: 'Vendas' },
    { type: 'EXPENSE', description: 'Aluguel do espaço', amount: 1500, category: 'Aluguel' },
    { type: 'EXPENSE', description: 'Compra de produtos', amount: 350, category: 'Estoque' },
    { type: 'INCOME', description: 'Serviço: Barba', amount: 25, category: 'Serviços' },
    { type: 'INCOME', description: 'Serviço: Hidratação', amount: 40, category: 'Serviços' },
    { type: 'EXPENSE', description: 'Energia elétrica', amount: 180, category: 'Utilities' },
  ]

  for (const t of transactions) {
    await prisma.financialTransaction.create({
      data: { barbershopId: barbershop.id, type: t.type as any, description: t.description, amount: t.amount, category: t.category },
    })
  }

  console.log('✅ Transações financeiras criadas:', transactions.length)

  // Notifications
  await prisma.notification.createMany({
    data: [
      { barbershopId: barbershop.id, type: 'RETENTION', title: 'Cliente retornando!', message: 'Bruno Ferreira está há 45 dias sem visitar a barbearia.' },
      { barbershopId: barbershop.id, type: 'STOCK', title: 'Estoque baixo', message: 'Gel Fixador está abaixo do estoque mínimo (2 unidades).' },
      { barbershopId: barbershop.id, type: 'RETENTION', title: 'Lembrete de retorno', message: 'Rafael Costa está há 35 dias sem vir. Considere entrar em contato.' },
    ],
  })

  console.log('✅ Notificações criadas')
  console.log('\n🚀 Seed concluído com sucesso!')
  console.log('\n📋 Credenciais de acesso:')
  console.log('   Admin: admin@barberflow.com / admin123')
  console.log('   Barbeiro: joao@barberflow.com / barber123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
