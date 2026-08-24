import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/header'
import { StatsCard } from '@/components/stats-card'
import { formatCurrency, getRetentionStatus } from '@/lib/utils'
import { RetentionBadge } from '@/components/retention-badge'
import { DollarSign, Calendar, Users, Package, Clock, TrendingUp } from 'lucide-react'
import { RevenueChart } from './revenue-chart'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const barbershopId = session?.user?.barbershopId

  if (!barbershopId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: '#52525B' }}>Nenhuma barbearia associada à sua conta.</p>
      </div>
    )
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    totalClients,
    appointmentsToday,
    monthRevenue,
    allProducts,
    recentAppointments,
    retentionConfig,
    clients,
  ] = await Promise.all([
    prisma.client.count({ where: { barbershopId } }),
    prisma.appointment.count({ where: { barbershopId, scheduledAt: { gte: startOfToday }, status: { not: 'CANCELLED' } } }),
    prisma.financialTransaction.aggregate({
      where: { barbershopId, type: 'INCOME', createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.product.findMany({ where: { barbershopId }, select: { stockQty: true, minStock: true } }),
    prisma.appointment.findMany({
      where: { barbershopId, scheduledAt: { gte: startOfToday } },
      include: { client: true, service: true, barber: { include: { user: true } } },
      orderBy: { scheduledAt: 'asc' },
      take: 6,
    }),
    prisma.retentionConfig.findFirst({ where: { barbershopId } }),
    prisma.client.findMany({
      where: { barbershopId },
      orderBy: { lastVisitAt: 'asc' },
      take: 6,
      select: { id: true, name: true, lastVisitAt: true, phone: true },
    }),
  ])

  const revenue = monthRevenue._sum.amount ?? 0
  const retentionDays = retentionConfig?.defaultDays ?? 30
  const lowStockCount = allProducts.filter(p => p.stockQty <= p.minStock).length

  const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
    CONFIRMED: { label: 'Confirmado', bg: 'rgba(16,185,129,0.08)', color: '#10B981', border: 'rgba(16,185,129,0.2)' },
    PENDING: { label: 'Pendente', bg: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: 'rgba(245,158,11,0.2)' },
    COMPLETED: { label: 'Concluído', bg: 'rgba(99,102,241,0.08)', color: '#6366F1', border: 'rgba(99,102,241,0.2)' },
    CANCELLED: { label: 'Cancelado', bg: 'rgba(239,68,68,0.08)', color: '#EF4444', border: 'rgba(239,68,68,0.2)' },
    IN_PROGRESS: { label: 'Em andamento', bg: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: 'rgba(212,175,55,0.2)' },
    NO_SHOW: { label: 'Não veio', bg: 'rgba(82,82,91,0.08)', color: '#52525B', border: 'rgba(82,82,91,0.2)' },
  }

  return (
    <div className="flex-1">
      <Header title="Dashboard" subtitle={`Bem-vindo de volta, ${session?.user?.name?.split(' ')[0]}!`} />
      <div className="p-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard title="Receita do mês" value={formatCurrency(revenue)} icon={DollarSign} accent="success" index={0} />
          <StatsCard title="Agendamentos hoje" value={String(appointmentsToday)} icon={Calendar} accent="gold" index={1} />
          <StatsCard title="Total de clientes" value={String(totalClients)} icon={Users} accent="info" index={2} />
          <StatsCard title="Estoque baixo" value={String(lowStockCount)} icon={Package} accent="warning" index={3} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <RevenueChart barbershopId={barbershopId} />
          </div>
          <div className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #242424' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
                <TrendingUp className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Retenção de clientes</h3>
            </div>
            <div className="space-y-1">
              {clients.map(client => {
                const status = getRetentionStatus(client.lastVisitAt, retentionDays)
                return (
                  <div key={client.id} className="flex items-center justify-between py-2.5 px-1" style={{ borderBottom: '1px solid #181818' }}>
                    <div className="min-w-0 mr-3">
                      <p className="text-sm font-medium truncate" style={{ color: '#FAFAFA' }}>{client.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>{client.phone}</p>
                    </div>
                    <RetentionBadge status={status} />
                  </div>
                )
              })}
              {clients.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: '#3A3A3A' }}>Nenhum cliente ainda</p>
              )}
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #242424' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
              <Clock className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Agendamentos de hoje</h3>
            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.15)' }}>
              {recentAppointments.length} agendamento{recentAppointments.length !== 1 ? 's' : ''}
            </span>
          </div>
          {recentAppointments.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#3A3A3A' }}>
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAppointments.map(apt => {
                const sc = statusConfig[apt.status] ?? statusConfig.PENDING
                return (
                  <div key={apt.id} className="flex items-center gap-4 px-3 py-3 rounded-lg" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                    <div className="w-14 text-center flex-shrink-0 py-1 rounded-lg" style={{ background: 'rgba(212,175,55,0.06)' }}>
                      <p className="text-sm font-bold" style={{ color: '#D4AF37' }}>
                        {new Date(apt.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{apt.client.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>{apt.service.name} · {apt.barber.user.name}</p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {sc.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
