import { useState, useRef, useEffect } from 'react'
import type { TokenAccountView } from '../../types/escrow'

type TokenSelectProps = {
  value: string
  options: TokenAccountView[]
  onChange: (value: string) => void
  placeholder?: string
  showCustomOption?: boolean
  className?: string
  position?: 'top' | 'bottom'
  disabledOptions?: string[]
  isFaded?: boolean
}

export function TokenSelect({
  value,
  options,
  onChange,
  placeholder = 'Select',
  showCustomOption = false,
  className = '',
  position = 'bottom',
  disabledOptions = [],
  isFaded = false,
}: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.mintAddress === value)
  
  const displayLabel = selectedOption 
    ? `${selectedOption.mintAddress.slice(0, 4)}...${selectedOption.mintAddress.slice(-4)}`
    : (value.length >= 32 ? `${value.slice(0, 4)}...${value.slice(-4)}` : placeholder)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      setSearchValue('')
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const filteredOptions = options.filter(opt => 
    opt.mintAddress.toLowerCase().includes(searchValue.toLowerCase())
  )

  const isSolanaAddress = (addr: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)
  const showManualEntry = showCustomOption && searchValue.length >= 32 && isSolanaAddress(searchValue) && !options.find(o => o.mintAddress === searchValue)

  return (
    <div className={`relative flex-shrink-0 ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-11 w-32 items-center justify-between gap-2 rounded-2xl border border-white/5 bg-zinc-800/80 px-3 transition-all hover:bg-zinc-700/80 focus:outline-none focus:ring-1 focus:ring-white/10 active:scale-95 shadow-sm backdrop-blur-md ${isFaded ? 'opacity-40' : 'opacity-100'}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption ? (
            <div className="h-4 w-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
          ) : (
            <div className="h-4 w-4 rounded-full bg-white/5 flex items-center justify-center shrink-0" />
          )}
          <span className="truncate text-[10px] font-black uppercase tracking-tight text-white/90">
            {displayLabel}
          </span>
        </div>
        <span className={`text-[8px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className={`absolute right-0 z-[1000] w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#121214] shadow-[0_30px_90px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200 ${
          position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}>
          <div className="p-2 border-b border-white/5">
            <input 
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] font-mono text-white outline-none focus:border-white/20 transition-all placeholder:text-zinc-500"
              placeholder="Search or Paste Address..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          
          <div className="max-h-60 min-h-[120px] overflow-y-auto p-1.5 custom-scrollbar">
            {filteredOptions.length === 0 && !showManualEntry && (
              <div className="py-10 px-4 text-center flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center opacity-30">
                  <span className="text-lg">📭</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {searchValue.length > 0 ? 'No Matches' : 'No Tokens'}
                  </p>
                  <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter leading-relaxed">
                    {searchValue.length > 0 ? 'Try searching different address' : 'Connect wallet to view your assets'}
                  </p>
                </div>
              </div>
            )}
            
            {filteredOptions.map((option) => {
              const isDisabled = disabledOptions.includes(option.mintAddress)
              
              return (
                <button
                  key={option.mintAddress}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(option.mintAddress)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all group ${
                    isDisabled 
                      ? 'opacity-50 grayscale cursor-not-allowed' 
                      : 'hover:bg-white/5'
                  } ${value === option.mintAddress ? 'bg-white/5' : ''}`}
                >
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <span className={`text-[10px] font-bold transition-colors ${
                      isDisabled ? 'text-zinc-500' : 'text-white'
                    }`}>
                      {option.mintAddress.slice(0, 6)}...{option.mintAddress.slice(-6)}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest transition-colors">
                      Bal: {option.amountUi}
                    </span>
                  </div>
                  {value === option.mintAddress && (
                    <span className="text-emerald-500 text-[10px]">✓</span>
                  )}
                </button>
              )
            })}

            {showManualEntry && (
              <>
                <div className="my-1 border-t border-white/5" />
                <button
                  type="button"
                  onClick={() => {
                    onChange(searchValue)
                    setIsOpen(false)
                  }}
                  className="flex flex-col w-full items-start gap-1.5 rounded-xl px-3 py-3.5 transition-all hover:bg-emerald-500 hover:text-black group border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)] mb-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-400 group-hover:text-black">
                      Use Custom Mint Address
                    </span>
                    <span className="text-[10px] group-hover:text-black">✨</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white group-hover:text-black transition-colors truncate w-full text-left bg-black/40 group-hover:bg-black/10 px-2 py-1 rounded-md">
                    {searchValue.slice(0, 12)}...{searchValue.slice(-12)}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
