'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, AlertTriangle, User, Scissors, Phone, Mail, ShieldCheck, Calendar, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type BarberForm = { name: string; email: string; password: string; phone: string; specialty: string }
const emptyForm: BarberForm = { name: '', email: '', password: '', phone: '', specialty: '' }

const DAYS = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 },
]

const defaultSchedule = DAYS.map(d => ({
  dayOfWeek: d.value,
  startTime: '09:00',
  endTime: '18:00',
  active: d.value >= 1 && d.value <= 6, // Seg-Sáb por padrão
}))

export default function TeamPage() {
  const [barbers, setBarbers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<BarberForm>(emptyForm)

  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<Omit<BarberForm, 'password'>>({ name: '', email: '', phone: '', specialty: '' })

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [scheduleTarget, setScheduleTarget] = useState<any | null>(null)
  const [schedule, setSchedule] = useState(defaultSchedule)
  const [scheduleSaved, setScheduleSaved] = useState(false)

  async function load() {
    const data = await fetch('/api/barbers').then(r => r.json())
    setBarbers(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    setLoading(true)
    const res = await fetch('/api/barbers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    })
    if (res.ok) { setCreateOpen(false); setCreateForm(emptyForm); load() }
    setLoading(false)
  }

  function openEdit(barber: any) {
    setEditTarget(barber)
    setEditForm({ name: barber.user?.name ?? '', email: barber.user?.email ?? '', phone: barber.user?.phone ?? '', specialty: barber.specialty ?? '' })
  }

  async function handleEdit() {
    if (!editTarget) return
    setLoading(true)
    await fetch(`/api/barbers/${editTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditTarget(null)
    load()
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/barbers/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleteTarget(null)
    setDeleting(false)
    load()
  }

  async function openSchedule(barber: any) {
    setScheduleTarget(barber)
    setScheduleSaved(false)
    const data = await fetch(`/api/barbers/${barber.id}/schedule`).then(r => r.json())
    if (Array.isArray(data) && data.length > 0) {
      // Mescla os dados salvos com o defaultSchedule
      const merged = defaultSchedule.map(def => {
        const saved = data.find((s: any) => s.dayOfWeek === def.dayOfWeek)
        return saved ? { ...def, startTime: saved.startTime, endTime: saved.endTime, active: saved.active } : def
      })
      setSchedule(merged)
    } else {
      setSchedule(defaultSchedule)
    }
  }

  async function handleSaveSchedule() {
    if (!scheduleTarget) return
    setLoading(true)
    await fetch(`/api/barbers/${scheduleTarget.id}/schedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedules: schedule }),
    })
    setScheduleSaved(true)
    setLoading(false)
    setTimeout(() => setScheduleSaved(false), 2000)
    load()
  }

  function updateScheduleDay(dayOfWeek: number, field: string, value: any) {
    setSchedule(prev => prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s))
  }

  const initials = (name: string) => name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '?'

  return (
    <div className="flex-1">
      <Header title="Equipe" subtitle="Gerencie os barbeiros da sua barbearia" />
      <div className="p-6">
        <div className="flex justify-end mb-5">
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo barbeiro
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {barbers.map((barber, i) => (
              <motion.div
                key={barber.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl p-5 group relative"
                style={{ background: '#111111', border: '1px solid #242424' }}
              >
                {/* Ações no hover */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => openSchedule(barber)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{ color: '#52525B' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#6366F1'; e.currentTarget.style.background = 'rgba(99,102,241,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#52525B'; e.currentTarget.style.background = 'transparent' }}
                    title="Configurar horários"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => openEdit(barber)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{ color: '#52525B' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.background = 'rgba(212,175,55,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#52525B'; e.currentTarget.style.background = 'transparent' }}
                    title="Editar barbeiro"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget({ id: barber.id, name: barber.user?.name })}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{ color: '#52525B' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#52525B'; e.currentTarget.style.background = 'transparent' }}
                    title="Excluir barbeiro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                    {initials(barber.user?.name ?? '')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: '#FAFAFA' }}>{barber.user?.name}</p>
                    {barber.specialty && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Scissors className="w-3 h-3 flex-shrink-0" style={{ color: '#52525B' }} />
                        <span className="text-xs truncate" style={{ color: '#52525B' }}>{barber.specialty}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-3" style={{ borderTop: '1px solid #1A1A1A' }}>
                  {barber.user?.email && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#A1A1AA' }}>
                      <Mail className="w-3 h-3 flex-shrink-0" style={{ color: '#52525B' }} />
                      <span className="truncate">{barber.user.email}</span>
                    </div>
                  )}
                  {barber.user?.phone && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#A1A1AA' }}>
                      <Phone className="w-3 h-3 flex-shrink-0" style={{ color: '#52525B' }} />
                      {barber.user.phone}
                    </div>
                  )}
                  {/* Dias de trabalho */}
                  {barber.schedules?.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: '#52525B' }} />
                      {barber.schedules.filter((s: any) => s.active).map((s: any) => (
                        <span key={s.dayOfWeek} className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37' }}>
                          {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][s.dayOfWeek]}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#52525B' }}>
                    <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                    Acesso: Barbeiro
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {barbers.length === 0 && (
            <div className="col-span-3 text-center py-16" style={{ color: '#3A3A3A' }}>
              <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum barbeiro cadastrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Novo Barbeiro */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4" style={{ color: '#D4AF37' }} /> Novo barbeiro
          </DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Nome *</Label>
              <Input placeholder="Nome completo" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Email *</Label>
                <Input placeholder="email@exemplo.com" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Senha *</Label>
                <Input type="password" placeholder="Senha de acesso" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Telefone</Label>
                <Input placeholder="(11) 99999-9999" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Especialidade</Label>
                <Input placeholder="Ex: Corte + Barba" value={createForm.specialty} onChange={e => setCreateForm(f => ({ ...f, specialty: e.target.value }))} />
              </div>
            </div>
            <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', color: '#A1A1AA' }}>
              Após criar, configure os horários de trabalho pelo ícone de calendário no card do barbeiro.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={loading || !createForm.name || !createForm.email || !createForm.password}>
              {loading ? 'Criando...' : 'Criar barbeiro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Barbeiro */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4" style={{ color: '#D4AF37' }} /> Editar barbeiro
          </DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Nome *</Label>
              <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Email</Label>
                <Input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Telefone</Label>
                <Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Especialidade</Label>
              <Input value={editForm.specialty} onChange={e => setEditForm(f => ({ ...f, specialty: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={loading || !editForm.name}>{loading ? 'Salvando...' : 'Salvar alterações'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Configurar Horários */}
      <Dialog open={!!scheduleTarget} onOpenChange={() => setScheduleTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: '#6366F1' }} />
              Horários — {scheduleTarget?.user?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            {DAYS.map(day => {
              const s = schedule.find(x => x.dayOfWeek === day.value)!
              return (
                <div key={day.value} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: s.active ? '#0F0F0F' : '#080808', border: `1px solid ${s.active ? '#242424' : '#161616'}` }}>
                  {/* Toggle dia */}
                  <button
                    onClick={() => updateScheduleDay(day.value, 'active', !s.active)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200"
                    style={s.active
                      ? { background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }
                      : { background: '#161616', color: '#3A3A3A', border: '1px solid #242424' }}
                  >
                    {day.label}
                  </button>

                  {s.active ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={s.startTime}
                        onChange={e => updateScheduleDay(day.value, 'startTime', e.target.value)}
                        className="flex-1 h-8 rounded-lg px-2 text-xs focus:outline-none transition-all"
                        style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#FAFAFA' }}
                      />
                      <span className="text-xs" style={{ color: '#52525B' }}>às</span>
                      <input
                        type="time"
                        value={s.endTime}
                        onChange={e => updateScheduleDay(day.value, 'endTime', e.target.value)}
                        className="flex-1 h-8 rounded-lg px-2 text-xs focus:outline-none transition-all"
                        style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#FAFAFA' }}
                      />
                    </div>
                  ) : (
                    <span className="text-xs flex-1" style={{ color: '#3A3A3A' }}>Folga</span>
                  )}
                </div>
              )
            })}
            <p className="text-xs pt-1" style={{ color: '#52525B' }}>
              Clique no dia para ativar/desativar. Os horários disponíveis no agendamento online serão gerados de 30 em 30 minutos.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleTarget(null)}>Fechar</Button>
            <Button onClick={handleSaveSchedule} disabled={loading} className="gap-2">
              {scheduleSaved ? <><Check className="w-4 h-4" /> Salvo!</> : loading ? 'Salvando...' : 'Salvar horários'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Excluir */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} /> Excluir barbeiro
          </DialogTitle></DialogHeader>
          <div className="py-2">
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              Tem certeza que deseja excluir <span className="font-semibold" style={{ color: '#FAFAFA' }}>{deleteTarget?.name}</span>?
            </p>
            <p className="text-xs mt-2" style={{ color: '#52525B' }}>O acesso ao sistema será removido. Os agendamentos já registrados não serão apagados.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <button onClick={handleDelete} disabled={deleting}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}>
              {deleting ? 'Excluindo...' : 'Sim, excluir'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
