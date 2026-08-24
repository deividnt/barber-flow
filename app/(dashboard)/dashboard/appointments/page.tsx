'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Calendar, Clock } from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

const selectStyle = {
  background: '#0A0A0A',
  border: '1px solid #242424',
  color: '#FAFAFA',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
}

const statusMap: Record<string, { label: string; bg: string; color: string; border: string }> = {
  PENDING:   { label: 'Pendente',     bg: 'rgba(245,158,11,0.08)',  color: '#F59E0B', border: 'rgba(245,158,11,0.2)'  },
  CONFIRMED: { label: 'Confirmado',   bg: 'rgba(16,185,129,0.08)', color: '#10B981', border: 'rgba(16,185,129,0.2)' },
  COMPLETED: { label: 'Concluído',    bg: 'rgba(99,102,241,0.08)', color: '#6366F1', border: 'rgba(99,102,241,0.2)' },
  CANCELLED: { label: 'Cancelado',    bg: 'rgba(239,68,68,0.08)',  color: '#EF4444', border: 'rgba(239,68,68,0.2)'  },
  NO_SHOW:   { label: 'Não compareceu', bg: 'rgba(82,82,91,0.08)', color: '#71717A', border: 'rgba(82,82,91,0.2)'   },
  IN_PROGRESS: { label: 'Em andamento', bg: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: 'rgba(212,175,55,0.2)' },
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ clientId: '', serviceId: '', barberId: '', scheduledAt: '' })
  const [loading, setLoading] = useState(false)

  async function load() {
    const [a, c, s, b] = await Promise.all([
      fetch('/api/appointments').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
      fetch('/api/barbers').then(r => r.json()),
    ])
    setAppointments(Array.isArray(a) ? a : [])
    setClients(Array.isArray(c) ? c : [])
    setServices(Array.isArray(s) ? s : [])
    setBarbers(Array.isArray(b) ? b : [])
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    setLoading(true)
    await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setOpen(false)
    setForm({ clientId: '', serviceId: '', barberId: '', scheduledAt: '' })
    load()
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/appointments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  const filtered = appointments.filter(a =>
    a.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.service?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1">
      <Header title="Agendamentos" subtitle="Gerencie todos os agendamentos da barbearia" />
      <div className="p-6">

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#52525B' }} />
            <Input
              placeholder="Buscar cliente ou serviço..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2 ml-auto">
            <Plus className="w-4 h-4" /> Novo agendamento
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #242424' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#161616', borderBottom: '1px solid #242424' }}>
                {['Cliente','Serviço','Barbeiro','Data/Hora','Valor','Status','Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#52525B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((apt, i) => {
                const sc = statusMap[apt.status] ?? statusMap.PENDING
                return (
                  <motion.tr
                    key={apt.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ background: i % 2 === 0 ? '#111111' : '#0E0E0E', borderBottom: '1px solid #1A1A1A' }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: '#FAFAFA' }}>{apt.client?.name}</td>
                    <td className="px-4 py-3" style={{ color: '#A1A1AA' }}>{apt.service?.name}</td>
                    <td className="px-4 py-3" style={{ color: '#A1A1AA' }}>{apt.barber?.user?.name}</td>
                    <td className="px-4 py-3" style={{ color: '#A1A1AA' }}>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" style={{ color: '#52525B' }} />
                        {formatDateTime(apt.scheduledAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: '#D4AF37' }}>{formatCurrency(apt.service?.price ?? 0)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {apt.status === 'PENDING' && (
                          <button onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                            className="text-xs font-medium transition-colors"
                            style={{ color: '#10B981' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#34D399')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#10B981')}>
                            Confirmar
                          </button>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <button onClick={() => updateStatus(apt.id, 'COMPLETED')}
                            className="text-xs font-medium transition-colors"
                            style={{ color: '#6366F1' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#818CF8')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#6366F1')}>
                            Concluir
                          </button>
                        )}
                        {!['COMPLETED','CANCELLED'].includes(apt.status) && (
                          <button onClick={() => updateStatus(apt.id, 'CANCELLED')}
                            className="text-xs font-medium transition-colors"
                            style={{ color: '#52525B' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#52525B')}>
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12" style={{ color: '#3A3A3A', background: '#111111' }}>
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: '#52525B' }} />
                    <p className="text-sm">Nenhum agendamento encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Cliente</Label>
              <select style={selectStyle} value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}>
                <option value="">Selecione um cliente...</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Serviço</Label>
              <select style={selectStyle} value={form.serviceId} onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))}>
                <option value="">Selecione um serviço...</option>
                {services.map((s: any) => <option key={s.id} value={s.id}>{s.name} — {formatCurrency(s.price)}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Barbeiro</Label>
              <select style={selectStyle} value={form.barberId} onChange={e => setForm(f => ({ ...f, barberId: e.target.value }))}>
                <option value="">Selecione um barbeiro...</option>
                {barbers.map((b: any) => <option key={b.id} value={b.id}>{b.user?.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Data e Hora</Label>
              <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'Salvando...' : 'Criar agendamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
