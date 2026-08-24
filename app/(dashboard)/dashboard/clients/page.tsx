'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RetentionBadge } from '@/components/retention-badge'
import { Plus, Search, Users, Phone, Mail, Trash2, Pencil, AlertTriangle } from 'lucide-react'
import { getRetentionStatus } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'

type ClientForm = { name: string; email: string; phone: string; birthDate: string; notes: string }

const emptyForm: ClientForm = { name: '', email: '', phone: '', birthDate: '', notes: '' }

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // Criar
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<ClientForm>(emptyForm)

  // Editar
  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<ClientForm>(emptyForm)

  // Excluir
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    const data = await fetch('/api/clients').then(r => r.json())
    setClients(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    setLoading(true)
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    })
    setCreateOpen(false)
    setCreateForm(emptyForm)
    load()
    setLoading(false)
  }

  function openEdit(client: any) {
    setEditTarget(client)
    setEditForm({
      name: client.name ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      birthDate: client.birthDate ? client.birthDate.substring(0, 10) : '',
      notes: client.notes ?? '',
    })
  }

  async function handleEdit() {
    if (!editTarget) return
    setLoading(true)
    await fetch(`/api/clients/${editTarget.id}`, {
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
    await fetch(`/api/clients/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleteTarget(null)
    setDeleting(false)
    load()
  }

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  function ClientFormFields({ form, setForm }: { form: ClientForm; setForm: (f: ClientForm) => void }) {
    return (
      <div className="space-y-4 py-2">
        <div>
          <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Nome *</Label>
          <Input placeholder="Nome completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Telefone</Label>
            <Input placeholder="(11) 99999-9999" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Email</Label>
            <Input placeholder="email@exemplo.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Nascimento</Label>
          <Input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Observações</Label>
          <Input placeholder="Preferências, alergias, etc..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <Header title="Clientes" subtitle="Gerencie sua base de clientes e retenção" />
      <div className="p-6">

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#52525B' }} />
            <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm" style={{ color: '#52525B' }}>{filtered.length} cliente{filtered.length !== 1 ? 's' : ''}</span>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Novo cliente
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #242424' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#161616', borderBottom: '1px solid #242424' }}>
                {['Cliente', 'Contato', 'Agendamentos', 'Última visita', 'Retenção', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#52525B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((client, i) => {
                  const status = getRetentionStatus(client.lastVisitAt, 30)
                  return (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.03 }}
                      className="group"
                      style={{ background: i % 2 === 0 ? '#111111' : '#0E0E0E', borderBottom: '1px solid #1A1A1A' }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}
                          >
                            {client.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: '#FAFAFA' }}>{client.name}</p>
                            {client.notes && <p className="text-xs" style={{ color: '#52525B' }}>{client.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#A1A1AA' }}>
                              <Phone className="w-3 h-3" style={{ color: '#52525B' }} /> {client.phone}
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#A1A1AA' }}>
                              <Mail className="w-3 h-3" style={{ color: '#52525B' }} /> {client.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold" style={{ color: '#D4AF37' }}>
                          {client._count?.appointments ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#A1A1AA' }}>
                        {client.lastVisitAt
                          ? new Date(client.lastVisitAt).toLocaleDateString('pt-BR')
                          : <span style={{ color: '#3A3A3A' }}>—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <RetentionBadge status={status} />
                      </td>

                      {/* Ações: aparecem no hover da linha */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* Editar */}
                          <button
                            onClick={() => openEdit(client)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                            style={{ color: '#52525B' }}
                            onMouseEnter={e => {
                              e.currentTarget.style.color = '#D4AF37'
                              e.currentTarget.style.background = 'rgba(212,175,55,0.1)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.color = '#52525B'
                              e.currentTarget.style.background = 'transparent'
                            }}
                            title="Editar cliente"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Excluir */}
                          <button
                            onClick={() => setDeleteTarget({ id: client.id, name: client.name })}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                            style={{ color: '#52525B' }}
                            onMouseEnter={e => {
                              e.currentTarget.style.color = '#EF4444'
                              e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.color = '#52525B'
                              e.currentTarget.style.background = 'transparent'
                            }}
                            title="Excluir cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12" style={{ color: '#3A3A3A', background: '#111111' }}>
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: '#52525B' }} />
                    <p className="text-sm">Nenhum cliente encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Cliente */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Cliente</DialogTitle></DialogHeader>
          <ClientFormFields form={createForm} setForm={setCreateForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={loading || !createForm.name}>
              {loading ? 'Salvando...' : 'Criar cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Cliente */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4" style={{ color: '#D4AF37' }} />
              Editar cliente
            </DialogTitle>
          </DialogHeader>
          <ClientFormFields form={editForm} setForm={setEditForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={loading || !editForm.name}>
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
              Excluir cliente
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              Tem certeza que deseja excluir{' '}
              <span className="font-semibold" style={{ color: '#FAFAFA' }}>{deleteTarget?.name}</span>?
            </p>
            <p className="text-xs mt-2" style={{ color: '#52525B' }}>
              Esta ação também removerá todos os agendamentos vinculados a este cliente. Não pode ser desfeita.
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
              {deleting ? 'Excluindo...' : 'Sim, excluir cliente'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
