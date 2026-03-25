import type { WalletAccountView } from '../../types/escrow'
import { Modal } from '../ui/modal'
import { RpcSettings } from './rpcSettings'

type WalletAccountModalProps = {
  open: boolean
  account: WalletAccountView | null
  currentRpc: string
  onClose: () => void
  onDisconnect: () => Promise<void>
  onRpcSave: (newRpc: string) => void
}

export function WalletAccountModal({
  open,
  account,
  currentRpc,
  onClose,
  onDisconnect,
  onRpcSave,
}: WalletAccountModalProps) {
  const handleRpcSave = (newRpc: string) => {
    onRpcSave(newRpc)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={account ? "Wallet" : "Settings"}
      description={account ? account.walletName : "Network Config"}
      onClose={onClose}
    >
      <div className="space-y-8">
        {/* Account Info Card (Only if connected) */}
        {account ? (
          <div className="bg-black/40 border border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Connected Address</span>
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <p className="text-white font-mono text-xs break-all leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 selection:bg-emerald-500/30">
              {account.address}
            </p>
            
            <button
              onClick={() => {
                void onDisconnect()
                onClose()
              }}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] py-3.5 rounded-xl transition-all border border-red-500/20 active:scale-95 mt-2"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl flex items-center justify-center text-center">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
              No wallet connected <br/> 
              <span className="text-emerald-500/60 lowercase font-normal italic">Configure network below</span>
            </p>
          </div>
        )}

        {/* RPC Settings Section */}
        <RpcSettings 
          open={open}
          currentRpc={currentRpc}
          onSave={handleRpcSave}
        />

        <button
          onClick={onClose}
          className="w-full bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all border border-white/5 active:scale-95"
        >
          Return to App
        </button>
      </div>
    </Modal>
  )
}
