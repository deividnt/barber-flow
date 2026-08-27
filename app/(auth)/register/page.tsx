'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  barbershopName: z.string().min(2, 'Nome da barbearia muito curto'),
})

type FormData = z.infer<typeof schema>

const inputStyle = {
  background: '#0A0A0A',
  border: '1px solid #242424',
  color: '#FAFAFA',
}

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError('')
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error || 'Erro ao criar conta')
      setLoading(false)
    } else {
      router.push('/login?registered=1')
    }
  }

  function focusStyle(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = 'rgba(212,175,55,0.45)'
    e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.08)'
  }
  function blurStyle(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = '#242424'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gold gradient blur */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="w-full max-w-sm px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.3))' }}
            >
              <Image
                src="/logo.png"
                alt="Barber Flow"
                width={200}
                height={200}
                className="object-contain"
                priority
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm mt-1"
              style={{ color: '#52525B' }}
            >
              Gestão inteligente para barbearias
            </motion.p>
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl p-6"
            style={{
              background: '#111111',
              border: '1px solid #1E1E1E',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#FAFAFA' }}>
              Criar conta
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg px-4 py-3 mb-4 text-sm font-medium"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#EF4444',
                }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#A1A1AA' }}>Nome completo</label>
                <input
                  {...register('name')}
                  placeholder="João Silva"
                  className="w-full h-10 rounded-lg px-3 text-sm transition-all duration-200 focus:outline-none"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
                {errors.name && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#A1A1AA' }}>Nome da barbearia</label>
                <input
                  {...register('barbershopName')}
                  placeholder="Barbearia do João"
                  className="w-full h-10 rounded-lg px-3 text-sm transition-all duration-200 focus:outline-none"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
                {errors.barbershopName && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.barbershopName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#A1A1AA' }}>Email</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full h-10 rounded-lg px-3 text-sm transition-all duration-200 focus:outline-none"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
                {errors.email && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#A1A1AA' }}>Senha</label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-10 rounded-lg px-3 text-sm transition-all duration-200 focus:outline-none"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
                {errors.password && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.password.message}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 mt-2 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F0C950 100%)',
                  color: '#0A0A0A',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(212,175,55,0.3)',
                }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Criar conta <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </form>

            <p className="text-center text-xs mt-5" style={{ color: '#3A3A3A' }}>
              Já tem conta?{' '}
              <a
                href="/login"
                className="font-medium transition-colors duration-200"
                style={{ color: '#D4AF37' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F0C950')}
                onMouseLeave={e => (e.currentTarget.style.color = '#D4AF37')}
              >
                Entrar
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
