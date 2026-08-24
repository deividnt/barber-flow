'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Scissors, Clock, DollarSign, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'

type ServiceForm = { name: string; description: string; price: string; durationMin: string }
const emptyForm: ServiceForm = { name: '', description: '', price: '', durationMin: '30' }

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Criar
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<ServiceForm>(emptyForm)

  // Editar
  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<ServiceForm>(emptyForm)

  // Excluir
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    const data = await fetch('/api/services').then(r => r.json())
    setServices(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    setLoading(true)
    await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...createForm,
        price: parseFloat(createForm.price),
        durationMin: parseInt(createForm.durationMin),
      }),
    })
    setCreateOpen(false)
    setCreateForm(emptyForm)
    load()
    setLoading(false)
  }

  function openEdit(service: any) {
    setEditTarget(service)
    setEditForm({
      name: service.name ?? '',
      description: service.description ?? '',
      price: service.price?.toString() ?? '',
      durationMin: service.durationMin?.toString() ?? '30',
    })
  }

  async function handleEdit() {
    if (!editTarget) return
    setLoading(true)
    await fetch(`/api/services/${editTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editForm.name,
        description: editForm.description || null,
        price: parseFloat(editForm.price),
        durationMin: parseInt(editForm.durationMin),
      }),
    })
    setEditTarget(null)
    load()
    setLoading(false)
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    load()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/services/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleteTarget(null)
    setDeleting(false)
    load()
  }

  function ServiceFormFields({ form, setForm }: { form: ServiceForm; setForm: (f: ServiceForm) => void }) {
    return (
      <div className="space-y-4 py-2">
        <div>
          <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Nome *</Label>
          <Input
            placeholder="Ex: Corte Masculino"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Descrição</Label>
          <Input
            placeholder="Descrição do serviço"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Preço (R$) *</Label>
            <Input
              type="number"
              placeholder="0,00"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Duração (min)</Label>
            <Input
              type="number"
              value={form.durationMin}
              onChange={e => setForm({ ...form, durationMin: e.target.value })}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <Header title="Serviços" subtitle="Gerencie os serviços oferecidos pela barbearia" />
      <div className="p-6">

        <div className="flex justify-end mb-5">
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo serviço
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl p-5 relative group"
                style={{
                  background: '#111111',
                  border: `1px solid ${service.active ? '#242424' : '#1A1A1A'}`,
                  opacity: service.active ? 1 : 0.55,
                  transition: 'border-color 0.2s, opacity 0.2s',
                }}
              >
                {/* Header do card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <Scissors className="w-4 h-4" style={{ color: '#D4AF37' }} />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botões de ação — aparecem no hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => openEdit(service)}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
                        style={{ color: '#52525B' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#D4AF37'
                          e.currentTarget.style.background = 'rgba(212,175,55,0.1)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = '#52525B'
                          e.currentTarget.style.background = 'transparent'
                        }}
                        title="Editar serviço"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: service.id, name: service.name })}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
                        style={{ color: '#52525B' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#EF4444'
                          e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = '#52525B'
                          e.currentTarget.style.background = 'transparent'
                        }}
                        title="Excluir serviço"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Badge ativo/inativo */}
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={service.active
                        ? { background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }
                        : { background: 'rgba(82,82,91,0.08)', color: '#52525B', border: '1px solid rgba(82,82,91,0.2)' }}>
                      {service.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold mb-1" style={{ color: '#FAFAFA' }}>{service.name}</h3>
                {service.description && (
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: '#52525B' }}>{service.description}</p>
                )}

                {/* Rodapé do card */}
                <div className="flex items-center justify-between pt-3 mt-3" style={{ borderTop: '1px solid #1A1A1A' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <DollarSign className="w-3 h-3" style={{ color: '#D4AF37' }} />
                      <span className="font-semibold" style={{ color: '#D4AF37' }}>{formatCurrency(service.price)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#52525B' }}>
                      <Clock className="w-3 h-3" />
                      {service.durationMin} min
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(service.id, service.active)}
                    className="text-xs font-medium transition-colors duration-200"
                    style={{ color: service.active ? '#EF4444' : '#10B981' }}
                  >
                    {service.active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {services.length === 0 && (
            <div className="col-span-3 text-center py-16" style={{ color: '#3A3A3A' }}>
              <Scissors className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum serviço cadastrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Novo Serviço */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Serviço</DialogTitle></DialogHeader>
          <ServiceFormFields form={createForm} setForm={setCreateForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={loading || !createForm.name || !createForm.price}>
              {loading ? 'Salvando...' : 'Criar serviço'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Serviço */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4" style={{ color: '#D4AF37' }} />
              Editar serviço
            </DialogTitle>
          </DialogHeader>
          <ServiceFormFields form={editForm} setForm={setEditForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={loading || !editForm.name || !editForm.price}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar exclusão */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
              Excluir serviço
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              Tem certeza que deseja excluir o serviço{' '}
              <span className="font-semibold" style={{ color: '#FAFAFA' }}>{deleteTarget?.name}</span>?
            </p>
            <p className="text-xs mt-2" style={{ color: '#52525B' }}>
              O serviço não aparecerá mais para novos agendamentos. Agendamentos já criados não serão afetados.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
            >
              {deleting ? 'Excluindo...' : 'Sim, excluir serviço'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
