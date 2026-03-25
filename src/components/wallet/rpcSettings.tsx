import { useState, useEffect } from 'react'
import { RPC_URL_STORAGE_KEY } from '../../constants/app'

type RpcSettingsProps = {
  currentRpc: string
  onSave: (newRpc: string) => void
  open: boolean
}

export function RpcSettings({ currentRpc, onSave, open }: RpcSettingsProps) {
  const [url, setUrl] = useState(currentRpc)

  useEffect(() => {
    if (open) {
      setUrl(currentRpc)
    }
  }, [open, currentRpc])

  const handleSave = () => {
    onSave(url)
  }

  const resetToDefault = () => {
    localStorage.removeItem(RPC_URL_STORAGE_KEY)
    window.location.reload()
  }

  return (
    <div className="space-y-4 pt-4 border-t border-white/5">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">
          Custom RPC Endpoint
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-xs font-mono text-zinc-300 outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-700"
        />
      </div>

      <p className="text-[10px] text-zinc-500/60 leading-relaxed italic px-1">
        Custom RPC will be saved in your browser's local storage.
      </p>

      <div className="grid grid-cols-2 gap-3 pt-2">
         <button
          onClick={resetToDefault}
          className="py-4 bg-zinc-800 text-zinc-500 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-700 transition-all active:scale-95"
        >
          Default
        </button>
        <button
          onClick={handleSave}
          className="py-4 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_10px_20px_rgba(16,185,129,0.15)]"
        >
          Save RPC
        </button>
      </div>
    </div>
  )
}
