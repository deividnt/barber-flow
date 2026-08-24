import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-40 relative overflow-hidden',
  {
    variants: {
      variant: {
        default: [
          'text-[#0A0A0A] font-semibold',
          'bg-gradient-to-r from-[#D4AF37] to-[#F0C950]',
          'hover:from-[#E0BB3F] hover:to-[#F8D050]',
          'shadow-[0_0_18px_rgba(212,175,55,0.3)]',
          'hover:shadow-[0_0_28px_rgba(212,175,55,0.45)]',
          'focus-visible:ring-[rgba(212,175,55,0.5)]',
        ].join(' '),
        destructive: [
          'bg-[rgba(239,68,68,0.1)] text-[#EF4444]',
          'border border-[rgba(239,68,68,0.2)]',
          'hover:bg-[rgba(239,68,68,0.18)] hover:border-[rgba(239,68,68,0.35)]',
        ].join(' '),
        outline: [
          'border border-[#242424] bg-transparent text-[#A1A1AA]',
          'hover:border-[rgba(212,175,55,0.3)] hover:text-[#FAFAFA] hover:bg-[#161616]',
        ].join(' '),
        secondary: [
          'bg-[#161616] text-[#A1A1AA]',
          'border border-[#242424]',
          'hover:bg-[#1C1C1C] hover:text-[#FAFAFA] hover:border-[#333333]',
        ].join(' '),
        ghost: [
          'text-[#52525B]',
          'hover:bg-[#161616] hover:text-[#FAFAFA]',
        ].join(' '),
        link: 'text-[#D4AF37] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs rounded-md',
        lg: 'h-11 px-6 rounded-lg text-base',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
