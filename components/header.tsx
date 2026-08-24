'use client'

import { Bell } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <motion.header
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center justify-between px-8 py-5"
      style={{
        background: '#0A0A0A',
        borderBottom: '1px solid #181818',
      }}
    >
      <div>
        <h1
          className="text-xl font-semibold tracking-tight"
          style={{ color: '#FAFAFA' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: '#52525B' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Link href="/dashboard/notifications">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200"
            style={{
              background: '#111111',
              border: '1px solid #242424',
              color: '#606060',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.3)'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#D4AF37'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(212,175,55,0.15)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#242424'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#606060'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
            }}
          >
            <Bell className="w-4 h-4" />
          </motion.button>
        </Link>

        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm cursor-default"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #F0C950 100%)',
            color: '#0A0A0A',
            boxShadow: '0 0 14px rgba(212,175,55,0.25)',
          }}
        >
          {session?.user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </motion.div>
      </div>
    </motion.header>
  )
}
