'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Bell, Package, TrendingUp, Info, CheckCheck, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const typeMap: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
  RETENTION: { icon: TrendingUp, color: '#D4AF37', bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.2)', label: 'Retenção' },
  STOCK:     { icon: Package,    color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Estoque'  },
  BIRTHDAY:  { icon: Info,       color: '#6366F1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', label: 'Aniversário' },
  GENERAL:   { icon: Bell,       color: '#A1A1AA', bg: 'rgba(161,161,170,0.08)', border: 'rgba(161,161,170,0.2)', label: 'Geral'  },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])

  async function load() {
    const data = await fetch('/api/notifications').then(r => r.json())
    setNotifications(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: true }) })
    load()
  }

  async function markAllRead() {
    await fetch('/api/notifications/mark-all', { method: 'PATCH' })
    load()
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="flex-1">
      <Header title="Notificações" subtitle="Alertas de retenção e eventos importantes" />
      <div className="p-6">

        {/* Header bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <span className="text-sm font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                {unread} não lida{unread !== 1 ? 's' : ''}
              </span>
            )}
            {unread === 0 && notifications.length > 0 && (
              <span className="text-sm" style={{ color: '#52525B' }}>Tudo lido</span>
            )}
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
              <CheckCheck className="w-3.5 h-3.5" /> Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Notifications list */}
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notif, i) => {
              const tc = typeMap[notif.type] ?? typeMap.GENERAL
              const Icon = tc.icon
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: notif.read ? '#0E0E0E' : '#111111',
                    border: `1px solid ${notif.read ? '#1A1A1A' : tc.border}`,
                    opacity: notif.read ? 0.6 : 1,
                  }}
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: tc.bg }}>
                    <Icon className="w-4 h-4" style={{ color: tc.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{notif.title}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                            {tc.label}
                          </span>
                          {!notif.read && (
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#D4AF37' }} />
                          )}
                        </div>
                        <p className="text-sm" style={{ color: '#A1A1AA' }}>{notif.message}</p>
                        <p className="text-xs mt-1" style={{ color: '#3A3A3A' }}>
                          {new Date(notif.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(notif.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={() => markRead(notif.id)}
                          className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                          style={{ background: '#161616', color: '#52525B', border: '1px solid #242424' }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.color = '#FAFAFA'
                            ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#333333'
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.color = '#52525B'
                            ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#242424'
                          }}
                        >
                          <Check className="w-3.5 h-3.5 inline mr-1" />Lida
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {notifications.length === 0 && (
            <div className="text-center py-16 rounded-xl" style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: '#52525B' }} />
              <p className="text-sm" style={{ color: '#3A3A3A' }}>Nenhuma notificação</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
