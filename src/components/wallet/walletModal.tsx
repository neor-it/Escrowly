import type { WalletConnectorView } from '../../types/escrow'
import { Modal } from '../ui/modal'

type WalletModalProps = {
  open: boolean
  connectors: WalletConnectorView[]
  isConnecting: boolean
  onClose: () => void
  onConnect: (connectorId: string) => Promise<void>
}

function WalletIcon({ connector }: { connector: WalletConnectorView }) {
  if (connector.icon) {
    return (
      <div className="relative">
        <img
          src={connector.icon}
          alt={`${connector.name} icon`}
          className="h-10 w-10 rounded-xl bg-zinc-800 object-cover p-1.5 border border-white/5"
        />
        {connector.isInstalled && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-zinc-900" title="Installed" />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-black">
      {connector.name.slice(0, 1).toUpperCase()}
    </div>
  )
}

export function WalletModal({
  open,
  connectors,
  isConnecting,
  onClose,
  onConnect,
}: WalletModalProps) {

  return (
    <Modal
      open={open}
      title="Connect Wallet"
      description="Select provider"
      onClose={onClose}
    >
      <div className="space-y-6">
        {connectors.length === 0 ? (
          <div className="bg-black/40 border border-white/5 p-12 rounded-2xl text-center">
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
              No compatible wallets <br/> detected in browser
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                type="button"
                className="group flex w-full items-center justify-between bg-black/40 border border-white/5 hover:border-white/10 px-4 py-3.5 rounded-2xl transition-all disabled:opacity-50 active:scale-[0.98]"
                disabled={isConnecting || !connector.supportsSolana}
                onClick={() => void onConnect(connector.id)}
              >
                <div className="flex items-center gap-4">
                  <WalletIcon connector={connector} />
                  <div className="text-left">
                    <span className="block text-sm font-bold text-white group-hover:text-white transition-colors">
                      {connector.name}
                    </span>
                    <span className="block text-[8px] font-bold uppercase tracking-widest text-zinc-600">
                      {!connector.supportsSolana
                        ? 'Incompatible'
                        : 'Solana Devnet'}
                    </span>
                  </div>
                </div>
                <div className="h-5 w-5 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white transition-all group-hover:border-transparent">
                    <span className="text-[10px] text-zinc-500 group-hover:text-black transition-colors font-bold">→</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] h-14 flex items-center justify-center rounded-xl transition-all border border-white/5 active:scale-95"
        >
          Close Selection
        </button>
      </div>
    </Modal>
  )
}
