import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'

type RetentionStatus = 'on-time' | 'warning' | 'overdue' | 'never'

const config: Record<RetentionStatus, {
  label: string
  icon: any
  bg: string
  color: string
  border: string
}> = {
  'on-time': {
    label: 'Em dia',
    icon: CheckCircle2,
    bg: 'rgba(16,185,129,0.08)',
    color: '#10B981',
    border: 'rgba(16,185,129,0.2)',
  },
  'warning': {
    label: 'Atenção',
    icon: AlertTriangle,
    bg: 'rgba(245,158,11,0.08)',
    color: '#F59E0B',
    border: 'rgba(245,158,11,0.2)',
  },
  'overdue': {
    label: 'Atrasado',
    icon: XCircle,
    bg: 'rgba(239,68,68,0.08)',
    color: '#EF4444',
    border: 'rgba(239,68,68,0.2)',
  },
  'never': {
    label: 'Nunca veio',
    icon: Clock,
    bg: 'rgba(99,102,241,0.08)',
    color: '#6366F1',
    border: 'rgba(99,102,241,0.2)',
  },
}

export function RetentionBadge({ status }: { status: RetentionStatus }) {
  const { label, icon: Icon, bg, color, border } = config[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}
