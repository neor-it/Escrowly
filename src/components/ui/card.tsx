import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

type CardProps = PropsWithChildren<{
  className?: string
}>

export function Card({ children, className }: CardProps) {
  return (
    <article
      className={cn(
        'glass rounded-2xl border border-border/80 bg-card p-4 text-card-foreground shadow-panel md:p-5',
        className,
      )}
    >
      {children}
    </article>
  )
}
