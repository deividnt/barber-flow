'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

const selectStyle = {
  background: '#0A0A0A', border: '1px solid #242424', color: '#FAFAFA',
  borderRadius: '8px', padding: '8px 12px', fontSize: '14px', width: '100%', outline: 'none',
}

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: 'INCOME', description: '', amount: '', category: '', date: '' })
  const [loading, setLoading] = useState(false)

  async function load() {
    const data = await fetch('/api/finances').then(r => r.json())
    setTransactions(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    setLoading(true)
    await fetch('/api/finances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    setOpen(false)
    setForm({ type: 'INCOME', description: '', amount: '', category: '', date: '' })
    load()
    setLoading(false)
  }

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="flex-1">
      <Header title="Financeiro" subtitle="Controle de receitas, despesas e fluxo de caixa" />
      <div className="p-6">

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Receitas (total)', value: totalIncome, icon: TrendingUp, accent: { bg: 'rgba(16,185,129,0.08)', color: '#10B981', border: 'rgba(16,185,129,0.2)' } },
            { label: 'Despesas (total)', value: totalExpense, icon: TrendingDown, accent: { bg: 'rgba(239,68,68,0.08)', color: '#EF4444', border: 'rgba(239,68,68,0.2)' } },
            { label: 'Saldo', value: balance, icon: Wallet, accent: balance >= 0 ? { bg: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: 'rgba(212,175,55,0.2)' } : { bg: 'rgba(239,68,68,0.08)', color: '#EF4444', border: 'rgba(239,68,68,0.2)' } },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl p-5"
              style={{ background: '#111111', border: '1px solid #242424' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: '#52525B' }}>{kpi.label}</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ color: kpi.label === 'Saldo' && balance < 0 ? '#EF4444' : '#FAFAFA' }}>
                    {balance < 0 && kpi.label === 'Saldo' ? '-' : ''}{formatCurrency(Math.abs(kpi.value))}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: kpi.accent.bg }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.accent.color }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo lançamento
          </Button>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #242424' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#161616', borderBottom: '1px solid #242424' }}>
                {['Descrição','Categoria','Data','Tipo','Valor'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#52525B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  style={{ background: i % 2 === 0 ? '#111111' : '#0E0E0E', borderBottom: '1px solid #1A1A1A' }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: '#FAFAFA' }}>{t.description}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#A1A1AA' }}>{t.category || '—'}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#A1A1AA' }}>
                    {t.date ? new Date(t.date).toLocaleDateString('pt-BR') : new Date(t.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={t.type === 'INCOME'
                        ? { background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }
                        : { background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {t.type === 'INCOME'
                        ? <><ArrowUpRight className="w-3 h-3" /> Receita</>
                        : <><ArrowDownRight className="w-3 h-3" /> Despesa</>}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold"
                    style={{ color: t.type === 'INCOME' ? '#10B981' : '#EF4444' }}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                </motion.tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12" style={{ color: '#3A3A3A', background: '#111111' }}>
                    <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum lançamento encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Lançamento</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Tipo</Label>
              <div className="grid grid-cols-2 gap-2">
                {[{v:'INCOME',l:'Receita',color:'#10B981'},{v:'EXPENSE',l:'Despesa',color:'#EF4444'}].map(opt => (
                  <button key={opt.v} onClick={() => setForm(f => ({ ...f, type: opt.v }))}
                    className="py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      background: form.type === opt.v ? `rgba(${opt.v === 'INCOME' ? '16,185,129' : '239,68,68'},0.1)` : '#161616',
                      border: form.type === opt.v ? `1px solid rgba(${opt.v === 'INCOME' ? '16,185,129' : '239,68,68'},0.3)` : '1px solid #242424',
                      color: form.type === opt.v ? opt.color : '#52525B',
                    }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Descrição *</Label>
              <Input placeholder="Descrição do lançamento" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Valor (R$) *</Label>
                <Input type="number" placeholder="0,00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Categoria</Label>
                <Input placeholder="Ex: Serviços" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Data</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={loading || !form.description || !form.amount}>
              {loading ? 'Salvando...' : 'Criar lançamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
