import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, style, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-lg px-3 py-2 text-sm',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'placeholder:text-[#3A3A3A]',
        'text-[#FAFAFA]',
        'focus-visible:outline-none',
        'transition-all duration-200',
        className
      )}
      style={{
        background: '#0A0A0A',
        border: '1px solid #242424',
        ...style,
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)'
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.08)'
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = '#242424'
        e.currentTarget.style.boxShadow = 'none'
      }}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
