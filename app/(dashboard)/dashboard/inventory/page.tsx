'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Package, AlertTriangle, ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'

type ProductForm = { name: string; category: string; unit: string; costPrice: string; salePrice: string; stockQty: string; minStock: string }
const emptyForm: ProductForm = { name: '', category: '', unit: 'UN', costPrice: '', salePrice: '', stockQty: '0', minStock: '0' }

function ProductFormFields({ form, setForm, showStock }: { form: any; setForm: (f: any) => void; showStock?: boolean }) {
  return (
    <div className="space-y-3 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Nome *</Label>
          <Input placeholder="Nome do produto" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Categoria</Label>
          <Input placeholder="Ex: Pomada" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Unidade</Label>
          <Input placeholder="UN" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Preço custo</Label>
          <Input type="number" placeholder="0.00" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Preço venda</Label>
          <Input type="number" placeholder="0.00" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} />
        </div>
        {showStock && (
          <div>
            <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Estoque inicial</Label>
            <Input type="number" value={form.stockQty} onChange={e => setForm({ ...form, stockQty: e.target.value })} />
          </div>
        )}
        <div>
          <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Estoque mínimo</Label>
          <Input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} />
        </div>
      </div>
    </div>
  )
}

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Criar
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<ProductForm>(emptyForm)

  // Editar
  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<Omit<ProductForm, 'stockQty'>>({ name: '', category: '', unit: 'UN', costPrice: '', salePrice: '', minStock: '0' })

  // Excluir
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Movimentar
  const [moveOpen, setMoveOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [moveForm, setMoveForm] = useState({ type: 'IN', qty: '', reason: '' })

  async function load() {
    const data = await fetch('/api/products').then(r => r.json())
    setProducts(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    setLoading(true)
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...createForm,
        costPrice: parseFloat(createForm.costPrice || '0'),
        salePrice: parseFloat(createForm.salePrice || '0'),
        stockQty: parseFloat(createForm.stockQty || '0'),
        minStock: parseFloat(createForm.minStock || '0'),
      }),
    })
    setCreateOpen(false)
    setCreateForm(emptyForm)
    load()
    setLoading(false)
  }

  function openEdit(product: any) {
    setEditTarget(product)
    setEditForm({
      name: product.name ?? '',
      category: product.category ?? '',
      unit: product.unit ?? 'UN',
      costPrice: product.costPrice?.toString() ?? '',
      salePrice: product.salePrice?.toString() ?? '',
      minStock: product.minStock?.toString() ?? '0',
    })
  }

  async function handleEdit() {
    if (!editTarget) return
    setLoading(true)
    await fetch(`/api/products/${editTarget.id}`, {
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
    await fetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleteTarget(null)
    setDeleting(false)
    load()
  }

  async function handleMove() {
    setLoading(true)
    await fetch(`/api/products/${selectedProduct.id}/movement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...moveForm, qty: parseFloat(moveForm.qty) }),
    })
    setMoveOpen(false)
    setMoveForm({ type: 'IN', qty: '', reason: '' })
    load()
    setLoading(false)
  }

  const lowStock = products.filter(p => p.stockQty <= p.minStock)

  return (
    <div className="flex-1">
      <Header title="Estoque" subtitle="Controle de produtos e movimentações" />
      <div className="p-6">

        {lowStock.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 text-sm font-medium"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {lowStock.length} produto{lowStock.length > 1 ? 's' : ''} com estoque baixo: {lowStock.map(p => p.name).join(', ')}
          </motion.div>
        )}

        <div className="flex justify-end mb-5">
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo produto
          </Button>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #242424' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#161616', borderBottom: '1px solid #242424' }}>
                {['Produto', 'Categoria', 'Estoque', 'Mínimo', 'Preço custo', 'Preço venda', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#52525B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {products.map((product, i) => {
                  const isLow = product.stockQty <= product.minStock
                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group"
                      style={{ background: i % 2 === 0 ? '#111111' : '#0E0E0E', borderBottom: '1px solid #1A1A1A' }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isLow && <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#F59E0B' }} />}
                          <span className="font-medium" style={{ color: isLow ? '#F59E0B' : '#FAFAFA' }}>{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#A1A1AA' }}>{product.category || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold" style={{ color: isLow ? '#F59E0B' : '#FAFAFA' }}>
                          {product.stockQty} {product.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#52525B' }}>{product.minStock} {product.unit}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#A1A1AA' }}>{formatCurrency(product.costPrice)}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#D4AF37' }}>{formatCurrency(product.salePrice)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Movimentar */}
                          <button
                            onClick={() => { setSelectedProduct(product); setMoveOpen(true) }}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                            style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.15)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)' }}
                          >
                            Movimentar
                          </button>

                          {/* Editar — aparece no hover */}
                          <button
                            onClick={() => openEdit(product)}
                            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                            style={{ color: '#52525B' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.background = 'rgba(212,175,55,0.1)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#52525B'; e.currentTarget.style.background = 'transparent' }}
                            title="Editar produto"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Excluir — aparece no hover */}
                          <button
                            onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                            style={{ color: '#52525B' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#52525B'; e.currentTarget.style.background = 'transparent' }}
                            title="Excluir produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12" style={{ color: '#3A3A3A', background: '#111111' }}>
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum produto cadastrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Produto */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Produto</DialogTitle></DialogHeader>
          <ProductFormFields form={createForm} setForm={setCreateForm} showStock />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={loading || !createForm.name}>{loading ? 'Salvando...' : 'Criar produto'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Produto */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4" style={{ color: '#D4AF37' }} />
              Editar produto
            </DialogTitle>
          </DialogHeader>
          <ProductFormFields form={editForm} setForm={setEditForm} />
          <div className="px-1 pb-1">
            <p className="text-xs" style={{ color: '#52525B' }}>
              O estoque atual não é alterado aqui. Use "Movimentar" para ajustar quantidades.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={loading || !editForm.name}>{loading ? 'Salvando...' : 'Salvar alterações'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar exclusão */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
              Excluir produto
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              Tem certeza que deseja excluir{' '}
              <span className="font-semibold" style={{ color: '#FAFAFA' }}>{deleteTarget?.name}</span>?
            </p>
            <p className="text-xs mt-2" style={{ color: '#52525B' }}>
              O produto não aparecerá mais no PDV. As vendas já realizadas não serão afetadas.
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
              {deleting ? 'Excluindo...' : 'Sim, excluir produto'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Movimentar Estoque */}
      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Movimentar Estoque</DialogTitle></DialogHeader>
          <div className="py-2">
            <p className="text-sm mb-4" style={{ color: '#A1A1AA' }}>
              Produto: <span style={{ color: '#FAFAFA', fontWeight: 600 }}>{selectedProduct?.name}</span>
              <span className="ml-2" style={{ color: '#D4AF37' }}>({selectedProduct?.stockQty} {selectedProduct?.unit})</span>
            </p>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Tipo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 'IN', l: 'Entrada', icon: ArrowUp, color: '#10B981' }, { v: 'OUT', l: 'Saída', icon: ArrowDown, color: '#EF4444' }].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setMoveForm(f => ({ ...f, type: opt.v }))}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{
                        background: moveForm.type === opt.v ? `rgba(${opt.v === 'IN' ? '16,185,129' : '239,68,68'},0.1)` : '#161616',
                        border: moveForm.type === opt.v ? `1px solid rgba(${opt.v === 'IN' ? '16,185,129' : '239,68,68'},0.3)` : '1px solid #242424',
                        color: moveForm.type === opt.v ? opt.color : '#52525B',
                      }}
                    >
                      <opt.icon className="w-4 h-4" /> {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Quantidade</Label>
                <Input type="number" placeholder="0" value={moveForm.qty} onChange={e => setMoveForm(f => ({ ...f, qty: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Motivo</Label>
                <Input placeholder="Ex: Compra de fornecedor" value={moveForm.reason} onChange={e => setMoveForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveOpen(false)}>Cancelar</Button>
            <Button onClick={handleMove} disabled={loading || !moveForm.qty}>{loading ? 'Salvando...' : 'Confirmar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
