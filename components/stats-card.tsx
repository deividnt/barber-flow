import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  accent?: 'gold' | 'success' | 'warning' | 'danger' | 'info'
  index?: number
}

const accentMap = {
  gold:    { icon: 'rgba(212,175,55,0.12)',  iconColor: '#D4AF37', border: 'rgba(212,175,55,0.22)',  hover: 'rgba(212,175,55,0.08)'  },
  success: { icon: 'rgba(16,185,129,0.1)',   iconColor: '#10B981', border: 'rgba(16,185,129,0.22)',  hover: 'rgba(16,185,129,0.06)'  },
  warning: { icon: 'rgba(245,158,11,0.1)',   iconColor: '#F59E0B', border: 'rgba(245,158,11,0.22)',  hover: 'rgba(245,158,11,0.06)'  },
  danger:  { icon: 'rgba(239,68,68,0.1)',    iconColor: '#EF4444', border: 'rgba(239,68,68,0.22)',   hover: 'rgba(239,68,68,0.06)'   },
  info:    { icon: 'rgba(99,102,241,0.1)',   iconColor: '#6366F1', border: 'rgba(99,102,241,0.22)',  hover: 'rgba(99,102,241,0.06)'  },
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  accent = 'gold',
}: StatsCardProps) {
  const colors = accentMap[accent]

  return (
    <div
      className="stats-card group relative rounded-xl p-5 cursor-default"
      style={{
        background: '#111111',
        border: '1px solid #242424',
        '--card-border-hover': colors.border,
        '--card-shadow-hover': colors.hover,
      } as React.CSSProperties}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-wide truncate"
            style={{ color: '#52525B' }}
          >
            {title}
          </p>
          <p
            className="text-2xl font-bold mt-2 tracking-tight"
            style={{ color: '#FAFAFA' }}
          >
            {value}
          </p>
          {change && (
            <p
              className="text-xs mt-1.5 font-medium"
              style={{
                color:
                  changeType === 'up'   ? '#10B981' :
                  changeType === 'down' ? '#EF4444' :
                  '#52525B',
              }}
            >
              {change}
            </p>
          )}
        </div>

        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-4"
          style={{ background: colors.icon }}
        >
          <Icon className="w-5 h-5" style={{ color: colors.iconColor }} />
        </div>
      </div>

      {/* Accent top line on hover */}
      <div
        className="absolute top-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.iconColor}, transparent)`,
        }}
      />
    </div>
  )
}
