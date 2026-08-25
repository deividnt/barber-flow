'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, QrCode, CheckCircle2, Package, Scissors } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const paymentOptions = [
  { value: 'CASH', label: 'Dinheiro', icon: Banknote },
  { value: 'CARD', label: 'Cartão', icon: CreditCard },
  { value: 'PIX', label: 'PIX', icon: QrCode },
]

const selectStyle = {
  background: '#0A0A0A', border: '1px solid #242424', color: '#FAFAFA',
  borderRadius: '8px', padding: '8px 12px', fontSize: '14px', width: '100%', outline: 'none',
}

type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  type: 'product' | 'service'
  stockQty?: number
  category?: string
}

export default function SalesPage() {
  const [products, setProducts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [clientId, setClientId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [loading, setLoading] = useState(false)
  const [recentSales, setRecentSales] = useState<any[]>([])
  const [success, setSuccess] = useState(false)
  const [tab, setTab] = useState<'products' | 'services'>('services')

  async function load() {
    const [p, sv, c, s] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/sales').then(r => r.json()),
    ])
    setProducts(Array.isArray(p) ? p : [])
    setServices(Array.isArray(sv) ? sv.filter((s: any) => s.active) : [])
    setClients(Array.isArray(c) ? c : [])
    setRecentSales(Array.isArray(s) ? s : [])
  }

  useEffect(() => { load() }, [])

  function addToCart(item: CartItem) {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id && i.type === item.type)
      if (ex) return prev.map(i => i.id === item.id && i.type === item.type ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function removeFromCart(id: string, type: string) { setCart(prev => prev.filter(i => !(i.id === id && i.type === type))) }
  function updateQty(id: string, type: string, qty: number) {
    if (qty <= 0) { removeFromCart(id, type); return }
    setCart(prev => prev.map(i => i.id === id && i.type === type ? { ...i, qty } : i))
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  async function checkout() {
    if (cart.length === 0) return
    setLoading(true)
    await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: clientId || null,
        paymentMethod,
        items: cart.map(i => ({
          productId: i.type === 'product' ? i.id : null,
          serviceId: i.type === 'service' ? i.id : null,
          itemName: i.name,
          qty: i.qty,
          unitPrice: i.price,
        })),
      }),
    })
    setCart([])
    setClientId('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2500)
    load()
    setLoading(false)
  }

  const payMethodLabel: Record<string, string> = { CASH: 'Dinheiro', CARD: 'Cartão', PIX: 'PIX', CREDIT_CARD: 'Crédito', DEBIT_CARD: 'Débito', OTHER: 'Outro' }

  return (
    <div className="flex-1">
      <Header title="PDV / Vendas" subtitle="Terminal de ponto de venda" />
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Left: tabs + grid */}
          <div className="xl:col-span-2">

            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: '#161616', border: '1px solid #242424' }}>
              {[
                { key: 'services', label: 'Serviços', icon: Scissors },
                { key: 'products', label: 'Produtos', icon: Package },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as any)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background: tab === t.key ? 'rgba(212,175,55,0.1)' : 'transparent',
                    color: tab === t.key ? '#D4AF37' : '#52525B',
                    border: tab === t.key ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
                  }}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tab === 'services' && services.map((s, i) => {
                const inCart = cart.find(c => c.id === s.id && c.type === 'service')
                return (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => addToCart({ id: s.id, name: s.name, price: s.price, qty: 1, type: 'service' })}
                    className="text-left rounded-xl p-4 transition-all duration-200 relative"
                    style={{
                      background: inCart ? 'rgba(212,175,55,0.06)' : '#111111',
                      border: inCart ? '1px solid rgba(212,175,55,0.3)' : '1px solid #242424',
                      boxShadow: inCart ? '0 0 16px rgba(212,175,55,0.1)' : 'none',
                    }}
                  >
                    {inCart && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: '#D4AF37', color: '#0A0A0A' }}>
                        {inCart.qty}
                      </div>
                    )}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: 'rgba(212,175,55,0.1)' }}>
                      <Scissors className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
                    </div>
                    <p className="font-medium text-sm pr-6" style={{ color: '#FAFAFA' }}>{s.name}</p>
                    {s.description && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#52525B' }}>{s.description}</p>}
                    <p className="text-base font-bold mt-2" style={{ color: '#D4AF37' }}>{formatCurrency(s.price)}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#3A3A3A' }}>{s.durationMin} min</p>
                  </motion.button>
                )
              })}

              {tab === 'products' && products.map((p, i) => {
                const inCart = cart.find(c => c.id === p.id && c.type === 'product')
                return (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => addToCart({ id: p.id, name: p.name, price: p.salePrice, qty: 1, type: 'product', stockQty: p.stockQty, category: p.category })}
                    className="text-left rounded-xl p-4 transition-all duration-200 relative"
                    style={{
                      background: inCart ? 'rgba(212,175,55,0.06)' : '#111111',
                      border: inCart ? '1px solid rgba(212,175,55,0.3)' : '1px solid #242424',
                      boxShadow: inCart ? '0 0 16px rgba(212,175,55,0.1)' : 'none',
                    }}
                  >
                    {inCart && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: '#D4AF37', color: '#0A0A0A' }}>
                        {inCart.qty}
                      </div>
                    )}
                    <p className="font-medium text-sm pr-6" style={{ color: '#FAFAFA' }}>{p.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>{p.category}</p>
                    <p className="text-base font-bold mt-2" style={{ color: '#D4AF37' }}>{formatCurrency(p.salePrice)}</p>
                    <p className="text-xs mt-0.5" style={{ color: p.stockQty <= 5 ? '#F59E0B' : '#52525B' }}>
                      Estoque: {p.stockQty}
                    </p>
                  </motion.button>
                )
              })}

              {tab === 'services' && services.length === 0 && (
                <p className="col-span-3 text-center py-10 text-sm" style={{ color: '#3A3A3A' }}>
                  Nenhum serviço ativo cadastrado
                </p>
              )}
              {tab === 'products' && products.length === 0 && (
                <p className="col-span-3 text-center py-10 text-sm" style={{ color: '#3A3A3A' }}>
                  Nenhum produto cadastrado
                </p>
              )}
            </div>

            {/* Recent Sales */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3A3A3A' }}>Vendas recentes</p>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #242424' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#161616', borderBottom: '1px solid #242424' }}>
                      {['Data','Cliente','Pagamento','Total'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#52525B' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.slice(0, 8).map((s: any, i) => (
                      <tr key={s.id} style={{ background: i % 2 === 0 ? '#111111' : '#0E0E0E', borderBottom: '1px solid #1A1A1A' }}>
                        <td className="px-4 py-3 text-sm" style={{ color: '#A1A1AA' }}>
                          {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#A1A1AA' }}>
                          {s.client?.name ?? <span style={{ color: '#3A3A3A' }}>Não identificado</span>}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#A1A1AA' }}>
                          {payMethodLabel[s.paymentMethod] ?? s.paymentMethod}
                        </td>
                        <td className="px-4 py-3 font-semibold" style={{ color: '#10B981' }}>
                          {formatCurrency(s.total)}
                        </td>
                      </tr>
                    ))}
                    {recentSales.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-sm" style={{ color: '#3A3A3A', background: '#111111' }}>
                          Nenhuma venda ainda
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cart panel */}
          <div className="sticky top-6 h-fit">
            <div className="rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid #242424' }}>
              {/* Cart header */}
              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
                  <ShoppingCart className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
                </div>
                <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Carrinho</h3>
                {cart.length > 0 && (
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                    {cart.reduce((s, i) => s + i.qty, 0)} itens
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="px-5 py-3 min-h-[120px]">
                <AnimatePresence>
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: '#52525B' }} />
                      <p className="text-sm" style={{ color: '#3A3A3A' }}>Selecione itens</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map(item => (
                        <motion.div
                          key={`${item.type}-${item.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 py-2"
                          style={{ borderBottom: '1px solid #1A1A1A' }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {item.type === 'service'
                                ? <Scissors className="w-3 h-3 flex-shrink-0" style={{ color: '#D4AF37' }} />
                                : <Package className="w-3 h-3 flex-shrink-0" style={{ color: '#52525B' }} />
                              }
                              <p className="text-sm font-medium truncate" style={{ color: '#FAFAFA' }}>{item.name}</p>
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>
                              {formatCurrency(item.price)} × {item.qty} = <span style={{ color: '#D4AF37' }}>{formatCurrency(item.price * item.qty)}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => updateQty(item.id, item.type, item.qty - 1)}
                              className="w-6 h-6 rounded-md flex items-center justify-center transition-colors duration-150"
                              style={{ background: '#1C1C1C', color: '#A1A1AA', border: '1px solid #2A2A2A' }}>
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold" style={{ color: '#FAFAFA' }}>{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.type, item.qty + 1)}
                              className="w-6 h-6 rounded-md flex items-center justify-center transition-colors duration-150"
                              style={{ background: '#1C1C1C', color: '#A1A1AA', border: '1px solid #2A2A2A' }}>
                              <Plus className="w-3 h-3" />
                            </button>
                            <button onClick={() => removeFromCart(item.id, item.type)} className="ml-1 transition-colors duration-150"
                              style={{ color: '#3A3A3A' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#3A3A3A')}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Checkout */}
              <div className="px-5 py-4 space-y-4" style={{ borderTop: '1px solid #1A1A1A' }}>
                <div>
                  <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#52525B' }}>Cliente (opcional)</Label>
                  <select style={selectStyle} value={clientId} onChange={e => setClientId(e.target.value)}>
                    <option value="">Sem identificação</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block" style={{ color: '#52525B' }}>Pagamento</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setPaymentMethod(opt.value)}
                        className="flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all duration-200"
                        style={{
                          background: paymentMethod === opt.value ? 'rgba(212,175,55,0.1)' : '#161616',
                          border: paymentMethod === opt.value ? '1px solid rgba(212,175,55,0.35)' : '1px solid #242424',
                          color: paymentMethod === opt.value ? '#D4AF37' : '#52525B',
                          boxShadow: paymentMethod === opt.value ? '0 0 12px rgba(212,175,55,0.12)' : 'none',
                        }}
                      >
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium" style={{ color: '#52525B' }}>Total</span>
                  <span className="text-2xl font-bold" style={{ color: '#D4AF37' }}>{formatCurrency(total)}</span>
                </div>

                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Venda finalizada!
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={checkout}
                  disabled={loading || cart.length === 0}
                  className="w-full h-10 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-40"
                  style={{
                    background: cart.length > 0 ? 'linear-gradient(135deg, #D4AF37 0%, #F0C950 100%)' : '#1C1C1C',
                    color: cart.length > 0 ? '#0A0A0A' : '#3A3A3A',
                    boxShadow: cart.length > 0 ? '0 0 20px rgba(212,175,55,0.25)' : 'none',
                  }}
                >
                  {loading ? 'Processando...' : 'Finalizar venda'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
