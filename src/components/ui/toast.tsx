import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ToastKind = 'success' | 'error' | 'info'

export type ToastViewModel = {
  id: string
  title: string
  description?: string
  kind: ToastKind
  action?: ReactNode
}

type ToastStackProps = {
  toasts: ToastViewModel[]
  onDismiss: (id: string) => void
}

const TOAST_KIND_CLASS: Record<ToastKind, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed right-3 top-3 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'rounded-xl border px-3 py-3 text-sm shadow-panel',
            TOAST_KIND_CLASS[toast.kind],
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-xs">{toast.description}</p> : null}
              {toast.action ? <div className="mt-2">{toast.action}</div> : null}
            </div>
            <button
              type="button"
              className="rounded border border-current px-1.5 py-0.5 text-xs opacity-80 hover:opacity-100"
              onClick={() => onDismiss(toast.id)}
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
