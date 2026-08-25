'use client'

import { useEffect, useRef, useState } from 'react'
import { Header } from '@/components/header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check, ImagePlus, Upload, User, Lock } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function ProfilePage() {
  const [barbershop, setBarbershop] = useState({ name: '', phone: '', address: '' })
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoSaved, setLogoSaved] = useState(false)
  const [logoError, setLogoError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Alterar acesso
  const [accessForm, setAccessForm] = useState({ email: '', currentPassword: '', newPassword: '', confirmPassword: '' })
  const [accessSaving, setAccessSaving] = useState(false)
  const [accessError, setAccessError] = useState('')
  const [accessSaved, setAccessSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/settings/barbershop').then(r => r.json()).then(d => {
      if (d) {
        setBarbershop({ name: d.name ?? '', phone: d.phone ?? '', address: d.address ?? '' })
        if (d.logo) setCurrentLogo(d.logo)
      }
    })
  }, [])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoError('')
    if (!file.type.startsWith('image/')) { setLogoError('Apenas imagens são permitidas.'); return }
    if (file.size > 2 * 1024 * 1024) { setLogoError('Imagem muito grande (máx 2MB).'); return }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
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

  async function handleAccessSave() {
    setAccessError('')
    if (!accessForm.currentPassword) { setAccessError('Informe a senha atual.'); return }
    if (accessForm.newPassword && accessForm.newPassword !== accessForm.confirmPassword) {
      setAccessError('As senhas novas não coincidem.'); return
    }
    setAccessSaving(true)
    const res = await fetch('/api/user/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: accessForm.email || undefined,
        currentPassword: accessForm.currentPassword,
        newPassword: accessForm.newPassword || undefined,
      }),
    })
    const data = await res.json()
    setAccessSaving(false)
    if (!res.ok) { setAccessError(data.error ?? 'Erro ao salvar.'); return }
    setAccessSaved(true)
    setTimeout(() => setAccessSaved(false), 3000)
    setAccessForm({ email: '', currentPassword: '', newPassword: '', confirmPassword: '' })
    // Se mudou email, faz logout para relogar com novo acesso
    if (accessForm.email) setTimeout(() => signOut({ callbackUrl: '/login' }), 2000)
  }

  async function handleSave() {
    setSaving(true)
    await fetch('/api/settings/barbershop', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(barbershop),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex-1">
      <Header title="Meu Perfil" subtitle="Personalize as informações da sua barbearia" />
      <div className="p-6 max-w-2xl space-y-5">

        {/* Logo */}
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

            <div className="flex-1">
              <p className="text-xs mb-3" style={{ color: '#52525B' }}>
                Faça upload da logo da sua barbearia. Ela aparecerá no topo da barra lateral.
                Formatos aceitos: PNG, JPG, SVG. Máximo 2MB.
              </p>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

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
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs font-medium"
                      style={{ color: '#10B981' }}
                    >
                      <Check className="w-3.5 h-3.5" /> Logo salva!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {logoFile && <p className="text-xs mt-2" style={{ color: '#52525B' }}>Arquivo: {logoFile.name}</p>}
              {logoError && <p className="text-xs mt-2" style={{ color: '#EF4444' }}>{logoError}</p>}
            </div>
          </div>
        </motion.div>

        {/* Dados */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl p-6"
          style={{ background: '#111111', border: '1px solid #242424' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
              <User className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Dados da barbearia</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Nome da barbearia</Label>
              <Input value={barbershop.name} onChange={e => setBarbershop(b => ({ ...b, name: e.target.value }))} placeholder="Nome da barbearia" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Telefone</Label>
              <Input value={barbershop.phone} onChange={e => setBarbershop(b => ({ ...b, phone: e.target.value }))} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Endereço</Label>
              <Input value={barbershop.address} onChange={e => setBarbershop(b => ({ ...b, address: e.target.value }))} placeholder="Rua, número, bairro, cidade" />
            </div>
          </div>
        </motion.div>

        {/* Alterar email e senha */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-6"
          style={{ background: '#111111', border: '1px solid #242424' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <Lock className="w-3.5 h-3.5" style={{ color: '#6366F1' }} />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>Alterar email e senha</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Novo email</Label>
              <Input value={accessForm.email} onChange={e => setAccessForm(f => ({ ...f, email: e.target.value }))}
                placeholder="novo@email.com" type="email" />
              <p className="text-xs mt-1" style={{ color: '#3A3A3A' }}>Deixe em branco para manter o atual</p>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Senha atual <span style={{ color: '#EF4444' }}>*</span></Label>
              <Input value={accessForm.currentPassword} onChange={e => setAccessForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="Sua senha atual" type="password" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Nova senha</Label>
                <Input value={accessForm.newPassword} onChange={e => setAccessForm(f => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Nova senha" type="password" />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Confirmar nova senha</Label>
                <Input value={accessForm.confirmPassword} onChange={e => setAccessForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Repita a nova senha" type="password" />
              </div>
            </div>

            {accessError && <p className="text-xs" style={{ color: '#EF4444' }}>{accessError}</p>}

            <div className="flex items-center gap-3">
              <Button onClick={handleAccessSave} disabled={accessSaving} className="px-5">
                {accessSaving ? 'Salvando...' : 'Atualizar acesso'}
              </Button>
              <AnimatePresence>
                {accessSaved && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-xs font-medium" style={{ color: '#10B981' }}>
                    <Check className="w-3.5 h-3.5" /> Salvo! Redirecionando para login...
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-end gap-3">
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: '#10B981' }}
              >
                <Check className="w-4 h-4" /> Salvo com sucesso
              </motion.span>
            )}
          </AnimatePresence>
          <Button onClick={handleSave} disabled={saving} className="px-6">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>

      </div>
    </div>
  )
}
