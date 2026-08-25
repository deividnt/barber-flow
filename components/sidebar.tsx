'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, Calendar, Users, Package, DollarSign,
  ShoppingCart, Bell, Settings, Scissors, BarChart3, LogOut, UserCog, UserCircle, Menu, X,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/dashboard',               label: 'Dashboard',    icon: LayoutDashboard, roles: ['ADMIN', 'BARBER'] },
  { href: '/dashboard/appointments',  label: 'Agendamentos', icon: Calendar,        roles: ['ADMIN', 'BARBER'] },
  { href: '/dashboard/clients',       label: 'Clientes',     icon: Users,           roles: ['ADMIN', 'BARBER'] },
  { href: '/dashboard/services',      label: 'Serviços',     icon: Scissors,        roles: ['ADMIN', 'BARBER'] },
  { href: '/dashboard/team',          label: 'Equipe',       icon: UserCog,         roles: ['ADMIN'] },
  { href: '/dashboard/inventory',     label: 'Estoque',      icon: Package,         roles: ['ADMIN', 'BARBER'] },
  { href: '/dashboard/sales',         label: 'PDV / Vendas', icon: ShoppingCart,    roles: ['ADMIN', 'BARBER'] },
  { href: '/dashboard/finances',      label: 'Financeiro',   icon: DollarSign,      roles: ['ADMIN', 'BARBER'] },
  { href: '/dashboard/reports',       label: 'Relatórios',   icon: BarChart3,       roles: ['ADMIN', 'BARBER'] },
  { href: '/dashboard/notifications', label: 'Notificações', icon: Bell,            roles: ['ADMIN', 'BARBER'] },
  { href: '/dashboard/profile',       label: 'Meu Perfil',   icon: UserCircle,      roles: ['BARBER'] },
  { href: '/dashboard/settings',      label: 'Configurações',icon: Settings,        roles: ['ADMIN'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role ?? 'BARBER'
  const visible = navItems.filter(item => item.roles.includes(role))

  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [barbershopName, setBarbershopName] = useState<string>('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/settings/barbershop')
      .then(r => r.json())
      .then(d => {
        if (d?.logo) setLogoUrl(d.logo)
        if (d?.name) setBarbershopName(d.name)
      })
      .catch(() => {})
  }, [pathname])

  // Fecha menu mobile ao navegar
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const NavContent = () => (
    <>
      {/* Logo */}
      <div
        className="flex items-center justify-center px-4 py-5"
        style={{ borderBottom: '1px solid #181818', minHeight: '88px' }}
      >
        {logoUrl ? (
          <Image src={logoUrl} alt={barbershopName || 'Logo'} width={180} height={72}
            className="object-contain max-h-16 w-full" priority unoptimized />
        ) : barbershopName ? (
          <p className="text-lg font-bold text-center leading-tight px-2"
            style={{ color: '#D4AF37', textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>
            {barbershopName}
          </p>
        ) : (
          <Image src="/logo.png" alt="Barber Flow" width={180} height={72}
            className="object-contain w-full" priority />
        )}
      </div>

      {/* User badge */}
      {session?.user && (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #181818' }}>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg" style={{ background: '#0F0F0F' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}>
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate" style={{ color: '#FAFAFA' }}>{session.user.name}</p>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#D4AF37' }}>
                {role === 'ADMIN' ? 'Admin' : 'Barbeiro'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visible.map((item, i) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <motion.div key={item.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}>
              <Link href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative"
                style={active ? {
                  background: 'rgba(212,175,55,0.1)', color: '#D4AF37',
                  boxShadow: '0 0 12px rgba(212,175,55,0.08)',
                } : { color: '#606060' }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#161616'; e.currentTarget.style.color = '#A1A1AA' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#606060' } }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: '#D4AF37' }} />
                )}
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid #181818' }}>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all duration-200"
          style={{ color: '#52525B' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#52525B'; e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sair
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-60 flex-col z-40 hidden md:flex"
        style={{ background: '#050505', borderRight: '1px solid #181818' }}>
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: '#050505', borderBottom: '1px solid #181818', height: '56px' }}>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
          ) : (
            <span className="text-sm font-bold" style={{ color: '#D4AF37' }}>{barbershopName || 'Barber Flow'}</span>
          )}
        </div>
        <button onClick={() => setMobileOpen(v => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: '#A1A1AA' }}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="md:hidden fixed top-0 left-0 h-screen w-60 flex flex-col z-50"
              style={{ background: '#050505', borderRight: '1px solid #181818' }}
            >
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
