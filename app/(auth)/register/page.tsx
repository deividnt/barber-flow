'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Scissors } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  barbershopName: z.string().min(2, 'Nome da barbearia muito curto'),
})

type FormData = z.infer<typeof schema>

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900">
      <div className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Barber Flow</h1>
          <p className="text-purple-300 mt-1">Crie sua barbearia agora</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Criar conta</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1.5">Nome completo</label>
              <input {...register('name')} placeholder="João Silva"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-purple-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1.5">Nome da barbearia</label>
              <input {...register('barbershopName')} placeholder="Barbearia do João"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-purple-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition" />
              {errors.barbershopName && <p className="text-red-400 text-xs mt-1">{errors.barbershopName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1.5">Email</label>
              <input {...register('email')} type="email" placeholder="seu@email.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-purple-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1.5">Senha</label>
              <input {...register('password')} type="password" placeholder="••••••••"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-purple-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all duration-200 mt-2 shadow-lg shadow-violet-500/30">
              {loading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-purple-300 text-sm mt-6">
            Já tem conta?{' '}
            <a href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition">Entrar</a>
          </p>
        </div>
      </div>
    </div>
  )
}
