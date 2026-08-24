'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl p-3 text-sm"
      style={{
        background: '#1A1A1A',
        border: '1px solid #2A2A2A',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <p className="font-semibold mb-2" style={{ color: '#A1A1AA' }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="font-medium" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function RevenueChart({ barbershopId }: { barbershopId: string }) {
  const [data, setData] = useState<{ month: string; receita: number; despesas: number }[]>([])

  useEffect(() => {
    fetch('/api/finances/chart').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  return (
    <div
      className="rounded-xl h-full"
      style={{ background: '#111111', border: '1px solid #242424' }}
    >
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.1)' }}
          >
            <TrendingUp className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>
            Receita vs Despesas
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#D4AF37' }} />
            <span className="text-xs" style={{ color: '#52525B' }}>Receita</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#EF4444' }} />
            <span className="text-xs" style={{ color: '#52525B' }}>Despesas</span>
          </div>
        </div>
      </div>

      <div className="px-2 pb-4">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="despesasGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1C" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#52525B' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#52525B' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="receita"
              name="Receita"
              stroke="#D4AF37"
              strokeWidth={2}
              fill="url(#receitaGrad)"
            />
            <Area
              type="monotone"
              dataKey="despesas"
              name="Despesas"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#despesasGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
