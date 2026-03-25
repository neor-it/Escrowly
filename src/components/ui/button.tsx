import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    isLoading?: boolean
    fullWidth?: boolean
  }
>

const BASE_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-accent text-accent-foreground shadow-floating hover:-translate-y-0.5 hover:brightness-110',
  secondary:
    'border-transparent bg-foreground text-background shadow-soft hover:-translate-y-0.5 hover:bg-slate-700',
  outline:
    'border-border bg-background text-foreground shadow-soft hover:border-accent/40 hover:bg-muted',
  danger:
    'border-transparent bg-destructive text-destructive-foreground shadow-soft hover:-translate-y-0.5 hover:brightness-110',
}

export function Button({
  children,
  variant = 'primary',
  className,
  isLoading = false,
  disabled,
  fullWidth = false,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        BASE_BUTTON_CLASS,
        VARIANT_CLASS[variant],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}
