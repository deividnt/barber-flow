'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Scissors, User, Calendar, Clock, CheckCircle2, ChevronLeft, ChevronRight, Phone, UserCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

type Step = 'service' | 'barber' | 'date' | 'time' | 'info' | 'confirm'

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>()

  const [barbershop, setBarbershop] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedBarber, setSelectedBarber] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  useEffect(() => {
    fetch(`/api/public/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setBarbershop)
      .catch(() => setNotFound(true))

    fetch(`/api/public/${slug}/services`).then(r => r.json()).then(setServices).catch(() => {})
    fetch(`/api/public/${slug}/barbers`).then(r => r.json()).then(setBarbers).catch(() => {})
  }, [slug])

  useEffect(() => {
    if (!selectedBarber || !selectedDate) return
    setSlots([])
    setSelectedTime(null)
    setLoadingSlots(true)
    fetch(`/api/public/${slug}/slots?barberId=${selectedBarber.id}&date=${toDateStr(selectedDate)}`)
      .then(r => r.json())
      .then(setSlots)
      .finally(() => setLoadingSlots(false))
  }, [selectedBarber, selectedDate, slug])

  async function handleSubmit() {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime || !clientName) return
    setSubmitting(true)
    const res = await fetch(`/api/public/${slug}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName,
        clientPhone,
        barberId: selectedBarber.id,
        serviceId: selectedService.id,
        date: toDateStr(selectedDate),
        time: selectedTime,
      }),
    })
    if (res.ok) {
      setStep('confirm')
    }
    setSubmitting(false)
  }

  // Calendário
  function buildCalendar(month: Date) {
    const year = month.getFullYear()
    const m = month.getMonth()
    const firstDay = new Date(year, m, 1).getDay()
    const daysInMonth = new Date(year, m + 1, 0).getDate()
    const cells: (Date | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d))
    return cells
  }

  function barberWorksOn(barber: any, date: Date) {
    const dow = date.getDay()
    return barber.schedules?.some((s: any) => s.dayOfWeek === dow && s.active)
  }

  const today = new Date(); today.setHours(0,0,0,0)
  const calendarCells = buildCalendar(calendarMonth)

  const stepOrder: Step[] = ['service', 'barber', 'date', 'time', 'info', 'confirm']
  const stepIndex = stepOrder.indexOf(step)

  const stepLabels: Record<Step, string> = {
    service: 'Serviço', barber: 'Barbeiro', date: 'Data',
    time: 'Horário', info: 'Seus dados', confirm: 'Confirmado',
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="text-center">
          <Scissors className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: '#D4AF37' }} />
          <p className="text-lg font-semibold" style={{ color: '#FAFAFA' }}>Barbearia não encontrada</p>
          <p className="text-sm mt-1" style={{ color: '#52525B' }}>Verifique o link e tente novamente</p>
        </div>
      </div>
    )
  }

  if (!barbershop) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#D4AF37', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: '#050505' }}>
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="max-w-lg mx-auto relative z-10">

        {/* Header da barbearia */}
        <div className="text-center mb-8">
          {barbershop.logo ? (
            <Image src={barbershop.logo} alt={barbershop.name} width={140} height={56} className="object-contain mx-auto mb-3" unoptimized />
          ) : (
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#D4AF37' }}>{barbershop.name}</h1>
          )}
          {barbershop.address && (
            <p className="text-xs" style={{ color: '#52525B' }}>{barbershop.address}</p>
          )}
        </div>

        {step !== 'confirm' && (
          <>
            {/* Steps indicator */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {(['service','barber','date','time','info'] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                    style={stepOrder.indexOf(s) < stepIndex
                      ? { background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }
                      : s === step
                      ? { background: '#D4AF37', color: '#0A0A0A' }
                      : { background: '#1A1A1A', color: '#3A3A3A' }}
                  >
                    {stepOrder.indexOf(s) < stepIndex ? '✓' : i + 1}
                  </div>
                  {i < 4 && <div className="w-6 h-px" style={{ background: stepOrder.indexOf(s) < stepIndex ? '#D4AF37' : '#242424' }} />}
                </div>
              ))}
            </div>

            {/* Resumo do que foi selecionado */}
            {(selectedService || selectedBarber || selectedDate || selectedTime) && (
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {selectedService && (
                  <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <Scissors className="w-3 h-3" /> {selectedService.name}
                  </span>
                )}
                {selectedBarber && (
                  <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <User className="w-3 h-3" /> {selectedBarber.user?.name}
                  </span>
                )}
                {selectedDate && (
                  <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <Calendar className="w-3 h-3" /> {selectedDate.toLocaleDateString('pt-BR')}
                  </span>
                )}
                {selectedTime && (
                  <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <Clock className="w-3 h-3" /> {selectedTime}
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {/* Card principal */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl p-6"
            style={{ background: '#111111', border: '1px solid #242424', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
          >

            {/* STEP: Serviço */}
            {step === 'service' && (
              <div>
                <h2 className="text-base font-semibold mb-4" style={{ color: '#FAFAFA' }}>Escolha o serviço</h2>
                <div className="space-y-2">
                  {services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => { setSelectedService(service); setStep('barber') }}
                      className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200"
                      style={{ background: '#0A0A0A', border: '1px solid #242424' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.background = 'rgba(212,175,55,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#242424'; e.currentTarget.style.background = '#0A0A0A' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,175,55,0.1)' }}>
                          <Scissors className="w-4 h-4" style={{ color: '#D4AF37' }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{service.name}</p>
                          {service.description && <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>{service.description}</p>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-sm font-semibold" style={{ color: '#D4AF37' }}>{formatCurrency(service.price)}</p>
                        <p className="text-xs" style={{ color: '#52525B' }}>{service.durationMin} min</p>
                      </div>
                    </button>
                  ))}
                  {services.length === 0 && (
                    <p className="text-center py-8 text-sm" style={{ color: '#52525B' }}>Nenhum serviço disponível</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP: Barbeiro */}
            {step === 'barber' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setStep('service')} style={{ color: '#52525B' }}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-semibold" style={{ color: '#FAFAFA' }}>Escolha o barbeiro</h2>
                </div>
                <div className="space-y-2">
                  {barbers.map(barber => (
                    <button
                      key={barber.id}
                      onClick={() => { setSelectedBarber(barber); setStep('date') }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                      style={{ background: '#0A0A0A', border: '1px solid #242424' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.background = 'rgba(212,175,55,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#242424'; e.currentTarget.style.background = '#0A0A0A' }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                        {barber.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{barber.user?.name}</p>
                        {barber.specialty && <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>{barber.specialty}</p>}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {barber.schedules?.map((s: any) => (
                            <span key={s.dayOfWeek} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37' }}>
                              {DAYS[s.dayOfWeek]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP: Data */}
            {step === 'date' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setStep('barber')} style={{ color: '#52525B' }}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-semibold" style={{ color: '#FAFAFA' }}>Escolha a data</h2>
                </div>

                {/* Navegação do mês */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: '#52525B' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                    onMouseLeave={e => e.currentTarget.style.color = '#52525B'}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <p className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>
                    {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                  </p>
                  <button
                    onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: '#52525B' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                    onMouseLeave={e => e.currentTarget.style.color = '#52525B'}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Cabeçalho dos dias */}
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-medium py-1" style={{ color: '#52525B' }}>{d}</div>
                  ))}
                </div>

                {/* Células do calendário */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarCells.map((date, i) => {
                    if (!date) return <div key={i} />
                    const isPast = date < today
                    const works = selectedBarber ? barberWorksOn(selectedBarber, date) : true
                    const isDisabled = isPast || !works
                    const isSelected = selectedDate?.toDateString() === date.toDateString()
                    const isToday_ = date.toDateString() === today.toDateString()
                    return (
                      <button
                        key={i}
                        disabled={isDisabled}
                        onClick={() => { setSelectedDate(date); setStep('time') }}
                        className="aspect-square rounded-lg text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed"
                        style={{
                          background: isSelected ? '#D4AF37' : isToday_ ? 'rgba(212,175,55,0.1)' : 'transparent',
                          color: isSelected ? '#0A0A0A' : isDisabled ? '#2A2A2A' : '#FAFAFA',
                          border: isToday_ && !isSelected ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent',
                        }}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>
                {selectedBarber && (
                  <p className="text-xs mt-3 text-center" style={{ color: '#52525B' }}>
                    Dias em cinza: {selectedBarber.user?.name} não trabalha
                  </p>
                )}
              </div>
            )}

            {/* STEP: Horário */}
            {step === 'time' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setStep('date')} style={{ color: '#52525B' }}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-semibold" style={{ color: '#FAFAFA' }}>Escolha o horário</h2>
                </div>
                {loadingSlots ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#D4AF37', borderTopColor: 'transparent' }} />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: '#52525B' }} />
                    <p className="text-sm" style={{ color: '#52525B' }}>Sem horários disponíveis nesse dia</p>
                    <button onClick={() => setStep('date')} className="text-xs mt-2 underline" style={{ color: '#D4AF37' }}>Escolher outra data</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => { setSelectedTime(slot); setStep('info') }}
                        className="py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                        style={{ background: '#0A0A0A', color: '#FAFAFA', border: '1px solid #242424' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; e.currentTarget.style.color = '#D4AF37' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#0A0A0A'; e.currentTarget.style.borderColor = '#242424'; e.currentTarget.style.color = '#FAFAFA' }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP: Dados do cliente */}
            {step === 'info' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setStep('time')} style={{ color: '#52525B' }}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-semibold" style={{ color: '#FAFAFA' }}>Seus dados</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Nome *</label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#52525B' }} />
                      <input
                        type="text"
                        placeholder="Seu nome"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        className="w-full h-10 rounded-lg pl-9 pr-3 text-sm focus:outline-none transition-all"
                        style={{ background: '#0A0A0A', border: '1px solid #242424', color: '#FAFAFA' }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.08)' }}
                        onBlur={e => { e.target.style.borderColor = '#242424'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Telefone (opcional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#52525B' }} />
                      <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        className="w-full h-10 rounded-lg pl-9 pr-3 text-sm focus:outline-none transition-all"
                        style={{ background: '#0A0A0A', border: '1px solid #242424', color: '#FAFAFA' }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.08)' }}
                        onBlur={e => { e.target.style.borderColor = '#242424'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>

                  {/* Resumo final */}
                  <div className="p-4 rounded-xl space-y-2" style={{ background: '#0A0A0A', border: '1px solid #1E1E1E' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#52525B' }}>Resumo do agendamento</p>
                    {[
                      { icon: Scissors, label: selectedService?.name, sub: formatCurrency(selectedService?.price) },
                      { icon: User, label: selectedBarber?.user?.name, sub: selectedBarber?.specialty },
                      { icon: Calendar, label: selectedDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) },
                      { icon: Clock, label: selectedTime },
                    ].map((item, i) => item.label && (
                      <div key={i} className="flex items-center gap-2.5">
                        <item.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                        <div>
                          <span className="text-sm" style={{ color: '#FAFAFA' }}>{item.label}</span>
                          {item.sub && <span className="text-xs ml-2" style={{ color: '#52525B' }}>{item.sub}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !clientName}
                    className="w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #F0C950)', color: '#0A0A0A', boxShadow: '0 0 20px rgba(212,175,55,0.3)' }}
                  >
                    {submitting ? 'Confirmando...' : 'Confirmar agendamento'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP: Confirmado */}
            {step === 'confirm' && (
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <CheckCircle2 className="w-8 h-8" style={{ color: '#10B981' }} />
                </motion.div>
                <h2 className="text-lg font-bold mb-1" style={{ color: '#FAFAFA' }}>Agendamento confirmado!</h2>
                <p className="text-sm mb-5" style={{ color: '#52525B' }}>Te esperamos na data marcada.</p>
                <div className="p-4 rounded-xl text-left space-y-2 mb-5" style={{ background: '#0A0A0A', border: '1px solid #1E1E1E' }}>
                  {[
                    { icon: Scissors, label: selectedService?.name },
                    { icon: User, label: selectedBarber?.user?.name },
                    { icon: Calendar, label: selectedDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) },
                    { icon: Clock, label: selectedTime },
                  ].map((item, i) => item.label && (
                    <div key={i} className="flex items-center gap-2.5">
                      <item.icon className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
                      <span className="text-sm" style={{ color: '#FAFAFA' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setStep('service'); setSelectedService(null); setSelectedBarber(null); setSelectedDate(null); setSelectedTime(null); setClientName(''); setClientPhone('') }}
                  className="text-sm font-medium underline"
                  style={{ color: '#D4AF37' }}
                >
                  Fazer outro agendamento
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-xs mt-6" style={{ color: '#2A2A2A' }}>Powered by Barber Flow</p>
      </div>
    </div>
  )
}
