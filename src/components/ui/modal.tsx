import { useEffect, type PropsWithChildren, type ReactNode } from 'react'

type ModalProps = PropsWithChildren<{
  open: boolean
  title: string
  description?: string
  footer?: ReactNode
  onClose: () => void
}>

export function Modal({
  open,
  title,
  description,
  footer,
  onClose,
  children,
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 border border-white/10 w-full max-w-md p-6 rounded-[28px] relative shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-500">
                {description}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {children}
        </div>

        {footer && (
          <div className="mt-6 border-t border-white/5 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
