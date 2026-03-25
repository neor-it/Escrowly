import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30',
        className,
      )}
      {...rest}
    />
  )
}
