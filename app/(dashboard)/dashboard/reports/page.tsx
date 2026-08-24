'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { DollarSign, Calendar, Users, TrendingUp, BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'

const GOLD_SHADES = ['#D4AF37','#B8960C','#E8C547','#8A6D00','#F0C950','#926F00']

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-3 text-sm" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
      <p className="font-semibold mb-1" style={{ color: '#A1A1AA' }}>{label}</p>
      {payload.map((e: any) => (
        <p key={e.name} style={{ color: '#D4AF37' }}>{formatCurrency(e.value)}</p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-3 text-sm" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
      <p style={{ color: '#FAFAFA' }}>{payload[0].name}</p>
      <p className="font-bold" style={{ color: '#D4AF37' }}>{payload[0].value} atendimentos</p>
    </div>
  )
}

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/reports').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  if (!data) return (
    <div className="flex-1">
      <Header title="Relatórios" subtitle="Análise completa da performance da barbearia" />
      <div className="p-6 space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-32 rounded-xl shimmer" />
        ))}
      </div>
    </div>
  )

  const kpis = [
    { label: 'Receita total', value: formatCurrency(data.totalRevenue ?? 0), icon: DollarSign, accent: { bg: 'rgba(16,185,129,0.08)', color: '#10B981', border: 'rgba(16,185,129,0.2)' } },
    { label: 'Total agendamentos', value: String(data.totalAppointments ?? 0), icon: Calendar, accent: { bg: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: 'rgba(212,175,55,0.2)' } },
    { label: 'Clientes ativos', value: String(data.activeClients ?? 0), icon: Users, accent: { bg: 'rgba(99,102,241,0.08)', color: '#6366F1', border: 'rgba(99,102,241,0.2)' } },
    { label: 'Ticket médio', value: formatCurrency(data.avgTicket ?? 0), icon: TrendingUp, accent: { bg: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: 'rgba(212,175,55,0.2)' } },
  ]

  return (
    <div className="flex-1">
      <Header title="Relatórios" subtitle="Análise completa da performance da barbearia" />
      <div className="p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #242424' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: '#52525B' }}>{kpi.label}</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ color: '#FAFAFA' }}>{kpi.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: kpi.accent.bg }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.accent.color }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Monthly revenue bar chart */}
          <div className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #242424' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
                <BarChart3 className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Receita mensal</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.monthlyRevenue ?? []} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1C" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#52525B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#52525B' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} width={42} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Receita" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top services pie chart */}
          <div className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #242424' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
                <TrendingUp className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Serviços mais realizados</h3>
            </div>
            {data.topServices?.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={data.topServices} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                      {data.topServices.map((_: any, i: number) => (
                        <Cell key={i} fill={GOLD_SHADES[i % GOLD_SHADES.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {data.topServices.slice(0, 5).map((s: any, i: number) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: GOLD_SHADES[i % GOLD_SHADES.length] }} />
                        <span className="text-xs truncate" style={{ color: '#A1A1AA' }}>{s.name}</span>
                      </div>
                      <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: '#FAFAFA' }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-center py-10" style={{ color: '#3A3A3A' }}>Sem dados suficientes</p>
            )}
          </div>
        </div>

        {/* Barber performance table */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #242424' }}>
          <div className="flex items-center gap-2 px-5 py-4" style={{ background: '#161616', borderBottom: '1px solid #242424' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
              <Users className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Performance por barbeiro</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#161616', borderBottom: '1px solid #242424' }}>
                {['Barbeiro','Atendimentos','Receita gerada','Ticket médio'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#52525B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.barberStats ?? []).map((b: any, i: number) => (
                <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  style={{ background: i % 2 === 0 ? '#111111' : '#0E0E0E', borderBottom: '1px solid #1A1A1A' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                        {b.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: '#FAFAFA' }}>{b.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold" style={{ color: '#D4AF37' }}>{b.appointments}</td>
                  <td className="px-5 py-4 font-semibold" style={{ color: '#10B981' }}>{formatCurrency(b.revenue)}</td>
                  <td className="px-5 py-4" style={{ color: '#A1A1AA' }}>{formatCurrency(b.avgTicket)}</td>
                </motion.tr>
              ))}
              {(!data.barberStats || data.barberStats.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-sm" style={{ color: '#3A3A3A', background: '#111111' }}>
                    Sem dados de barbeiros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
