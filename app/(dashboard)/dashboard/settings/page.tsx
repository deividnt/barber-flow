'use client'

import { useEffect, useRef, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Shield, Check, AlertTriangle, Trash2, RotateCcw, ImagePlus, Upload, Link2, Copy, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import Image from 'next/image'

type DangerAction = 'finances' | 'clients' | null

export default function SettingsPage() {
  const [barbershop, setBarbershop] = useState({ name: '', phone: '', email: '', address: '' })
  const [slug, setSlug] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [retention, setRetention] = useState({ defaultDays: 30, warningDays: 7 })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Logo
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoSaved, setLogoSaved] = useState(false)
  const [logoError, setLogoError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Danger zone
  const [dangerAction, setDangerAction] = useState<DangerAction>(null)
  const [confirmText, setConfirmText] = useState('')
  const [dangerLoading, setDangerLoading] = useState(false)
  const [dangerDone, setDangerDone] = useState<string | null>(null)

  const dangerConfig = {
    finances: {
      title: 'Zerar histórico financeiro',
      description: 'Todas as transações financeiras serão permanentemente apagadas. Esta ação não pode ser desfeita.',
      confirmWord: 'ZERAR',
      endpoint: '/api/finances/all',
      successMsg: 'Histórico financeiro zerado com sucesso.',
    },
    clients: {
      title: 'Excluir todos os clientes',
      description: 'Todos os clientes e seus agendamentos serão permanentemente excluídos. Esta ação não pode ser desfeita.',
      confirmWord: 'EXCLUIR',
      endpoint: '/api/clients/all',
      successMsg: 'Todos os clientes foram excluídos com sucesso.',
    },
  }

  useEffect(() => {
    fetch('/api/settings/barbershop').then(r => r.json()).then(d => {
      if (d) {
        setBarbershop({ name: d.name ?? '', phone: d.phone ?? '', email: d.email ?? '', address: d.address ?? '' })
        if (d.logo) setCurrentLogo(d.logo)
        if (d.slug) setSlug(d.slug)
      }
    })
    fetch('/api/settings/retention').then(r => r.json()).then(d => {
      if (d) setRetention({ defaultDays: d.defaultDays ?? 30, warningDays: d.warningDays ?? 7 })
    })
  }, [])

  async function handleSave() {
    setLoading(true)
    await Promise.all([
      fetch('/api/settings/barbershop', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(barbershop) }),
      fetch('/api/settings/retention', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(retention) }),
    ])
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoError('')
    if (!file.type.startsWith('image/')) { setLogoError('Apenas imagens são permitidas.'); return }
    if (file.size > 2 * 1024 * 1024) { setLogoError('Imagem muito grande (máx 2MB).'); return }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function handleCopyLink() {
    if (!slug) return
    const url = `${window.location.origin}/agendar/${slug}`
    navigator.clipboard.writeText(url)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  async function handleLogoUpload() {
    if (!logoFile) return
    setLogoUploading(true)
    setLogoError('')
    const formData = new FormData()
    formData.append('logo', logoFile)
    const res = await fetch('/api/settings/logo', { method: 'POST', body: formData })
    const data = await res.json()
    if (res.ok) {
      setCurrentLogo(data.logoUrl)
      setLogoPreview(null)
      setLogoFile(null)
      setLogoSaved(true)
      setTimeout(() => setLogoSaved(false), 2500)
    } else {
      setLogoError(data.error ?? 'Erro ao fazer upload.')
    }
    setLogoUploading(false)
  }

  async function handleDangerConfirm() {
    if (!dangerAction) return
    const cfg = dangerConfig[dangerAction]
    if (confirmText !== cfg.confirmWord) return
    setDangerLoading(true)
    await fetch(cfg.endpoint, { method: 'DELETE' })
    setDangerLoading(false)
    setDangerAction(null)
    setConfirmText('')
    setDangerDone(cfg.successMsg)
    setTimeout(() => setDangerDone(null), 4000)
  }

  return (
    <div className="flex-1">
      <Header title="Configurações" subtitle="Personalize sua barbearia e preferências do sistema" />
      <div className="p-6 max-w-2xl space-y-5">

        {/* ── Logo da barbearia ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6"
          style={{ background: '#111111', border: '1px solid #242424' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
              <ImagePlus className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Logo da barbearia</h2>
          </div>

          <div className="flex items-start gap-5">
            {/* Preview atual */}
            <div
              className="w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: '#0A0A0A', border: '1px solid #242424' }}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-1" />
              ) : currentLogo ? (
                <Image src={currentLogo} alt="Logo atual" width={96} height={96} className="object-contain p-1" unoptimized />
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <ImagePlus className="w-6 h-6" style={{ color: '#3A3A3A' }} />
                  <span className="text-xs" style={{ color: '#3A3A3A' }}>Sem logo</span>
                </div>
              )}
            </div>

            {/* Controles */}
            <div className="flex-1">
              <p className="text-xs mb-3" style={{ color: '#52525B' }}>
                Faça upload da logo da sua barbearia. Ela aparecerá no topo da barra lateral.
                Formatos aceitos: PNG, JPG, SVG. Máximo 2MB.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{ background: '#1A1A1A', color: '#A1A1AA', border: '1px solid #2A2A2A' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.color = '#D4AF37' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#A1A1AA' }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  {currentLogo ? 'Trocar logo' : 'Escolher logo'}
                </button>

                {logoFile && (
                  <Button onClick={handleLogoUpload} disabled={logoUploading} className="text-xs px-3 py-2 h-auto">
                    {logoUploading ? 'Enviando...' : 'Salvar logo'}
                  </Button>
                )}

                <AnimatePresence>
                  {logoSaved && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs font-medium"
                      style={{ color: '#10B981' }}
                    >
                      <Check className="w-3.5 h-3.5" /> Logo salva!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {logoFile && (
                <p className="text-xs mt-2" style={{ color: '#52525B' }}>
                  Arquivo selecionado: {logoFile.name}
                </p>
              )}
              {logoError && (
                <p className="text-xs mt-2" style={{ color: '#EF4444' }}>{logoError}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Link de Agendamento Online ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl p-6"
          style={{ background: '#111111', border: '1px solid #242424' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <Link2 className="w-3.5 h-3.5" style={{ color: '#6366F1' }} />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Agendamento online</h2>
          </div>
          <p className="text-xs mb-4 ml-9" style={{ color: '#52525B' }}>
            Compartilhe este link com seus clientes para que eles possam agendar diretamente, sem precisar ligar.
          </p>

          {slug ? (
            <div className="ml-9">
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                style={{ background: '#0A0A0A', border: '1px solid #2A2A2A' }}
              >
                <span className="flex-1 text-xs font-mono truncate" style={{ color: '#A1A1AA' }}>
                  {typeof window !== 'undefined' ? window.location.origin : ''}/agendar/{slug}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex-shrink-0"
                  style={{
                    background: linkCopied ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                    color: linkCopied ? '#10B981' : '#6366F1',
                    border: `1px solid ${linkCopied ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.25)'}`,
                  }}
                >
                  {linkCopied ? (
                    <><Check className="w-3 h-3" /> Copiado!</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copiar</>
                  )}
                </button>
                <a
                  href={`/agendar/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 flex-shrink-0"
                  style={{ background: '#1A1A1A', color: '#52525B', border: '1px solid #2A2A2A' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#A1A1AA'; e.currentTarget.style.borderColor = '#3A3A3A' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#52525B'; e.currentTarget.style.borderColor = '#2A2A2A' }}
                  title="Abrir página de agendamento"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs mt-2" style={{ color: '#3A3A3A' }}>
                Seu slug único: <span className="font-mono" style={{ color: '#52525B' }}>{slug}</span>
              </p>
            </div>
          ) : (
            <div className="ml-9">
              <div className="h-8 w-64 rounded-lg shimmer" />
            </div>
          )}
        </motion.div>

        {/* ── Dados da barbearia ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl p-6"
          style={{ background: '#111111', border: '1px solid #242424' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
              <Settings className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Dados da barbearia</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Nome da barbearia</Label>
              <Input value={barbershop.name} onChange={e => setBarbershop(b => ({ ...b, name: e.target.value }))} placeholder="Nome da barbearia" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Telefone</Label>
                <Input value={barbershop.phone} onChange={e => setBarbershop(b => ({ ...b, phone: e.target.value }))} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Email</Label>
                <Input value={barbershop.email} onChange={e => setBarbershop(b => ({ ...b, email: e.target.value }))} placeholder="contato@barbearia.com" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Endereço</Label>
              <Input value={barbershop.address} onChange={e => setBarbershop(b => ({ ...b, address: e.target.value }))} placeholder="Rua, número, bairro, cidade" />
            </div>
          </div>
        </motion.div>

        {/* ── Retenção ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-6"
          style={{ background: '#111111', border: '1px solid #242424' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
              <Shield className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Retenção de clientes</h2>
          </div>
          <p className="text-xs mb-5 ml-9" style={{ color: '#52525B' }}>
            Configure com que frequência os clientes devem retornar para receber alertas de retenção.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Frequência padrão (dias)</Label>
              <Input type="number" value={retention.defaultDays} onChange={e => setRetention(r => ({ ...r, defaultDays: parseInt(e.target.value) || 30 }))} />
              <p className="text-xs mt-1" style={{ color: '#3A3A3A' }}>Ex: 30 = retorno a cada 30 dias</p>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Aviso antecipado (dias)</Label>
              <Input type="number" value={retention.warningDays} onChange={e => setRetention(r => ({ ...r, warningDays: parseInt(e.target.value) || 7 }))} />
              <p className="text-xs mt-1" style={{ color: '#3A3A3A' }}>Dias antes do prazo para alerta amarelo</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
            <p className="text-xs" style={{ color: '#52525B' }}>
              <span style={{ color: '#10B981' }}>● Em dia</span> — voltou nos últimos {retention.defaultDays - retention.warningDays} dias
              &nbsp;&nbsp;
              <span style={{ color: '#F59E0B' }}>● Atenção</span> — {retention.warningDays}d antes do prazo
              &nbsp;&nbsp;
              <span style={{ color: '#EF4444' }}>● Atrasado</span> — sem visita há +{retention.defaultDays} dias
            </p>
          </div>
        </motion.div>

        {/* Salvar */}
        <div className="flex items-center justify-end gap-3">
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: '#10B981' }}
              >
                <Check className="w-4 h-4" /> Configurações salvas
              </motion.span>
            )}
          </AnimatePresence>
          <Button onClick={handleSave} disabled={loading} className="px-6">
            {loading ? 'Salvando...' : 'Salvar configurações'}
          </Button>
        </div>

        {/* ── Zona de Perigo ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl p-6"
          style={{ background: '#0F0808', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: '#EF4444' }}>Zona de perigo</h2>
          </div>
          <p className="text-xs mb-5 ml-9" style={{ color: '#52525B' }}>
            Ações irreversíveis. Utilize com cuidado — os dados não poderão ser recuperados.
          </p>

          <AnimatePresence>
            {dangerDone && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}
              >
                <Check className="w-4 h-4 flex-shrink-0" />
                {dangerDone}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: '#0A0A0A', border: '1px solid #1E1E1E' }}>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4 flex-shrink-0" style={{ color: '#52525B' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>Zerar histórico financeiro</p>
                  <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>Remove todas as transações registradas</p>
                </div>
              </div>
              <button
                onClick={() => { setConfirmText(''); setDangerAction('finances') }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              >
                Zerar
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: '#0A0A0A', border: '1px solid #1E1E1E' }}>
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 flex-shrink-0" style={{ color: '#52525B' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>Excluir todos os clientes</p>
                  <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>Remove toda a base de clientes e agendamentos</p>
                </div>
              </div>
              <button
                onClick={() => { setConfirmText(''); setDangerAction('clients') }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              >
                Excluir tudo
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Modal zona de perigo */}
      <Dialog open={!!dangerAction} onOpenChange={() => { setDangerAction(null); setConfirmText('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
              {dangerAction ? dangerConfig[dangerAction].title : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              {dangerAction ? dangerConfig[dangerAction].description : ''}
            </p>
            <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444' }}>
              Esta ação é permanente e não pode ser desfeita.
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>
                Digite{' '}
                <span className="font-mono font-bold" style={{ color: '#EF4444' }}>
                  {dangerAction ? dangerConfig[dangerAction].confirmWord : ''}
                </span>
                {' '}para confirmar
              </Label>
              <Input value={confirmText} onChange={e => setConfirmText(e.target.value)} autoFocus
                placeholder={dangerAction ? dangerConfig[dangerAction].confirmWord : ''} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDangerAction(null); setConfirmText('') }}>Cancelar</Button>
            <button
              onClick={handleDangerConfirm}
              disabled={dangerLoading || (dangerAction ? confirmText !== dangerConfig[dangerAction].confirmWord : true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(239,68,68,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
            >
              {dangerLoading ? 'Aguarde...' : 'Confirmar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
