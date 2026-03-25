import { useMemo } from 'react'
import type { TokenAccountView } from '../../types/escrow'
import { TokenSelect } from '../ui/tokenSelect'

type MakeOfferPanelProps = {
  tokenAccounts: TokenAccountView[]
  selectedTokenAMintAddress: string
  tokenAAmountUi: string
  tokenBMintAddress: string
  tokenBRequiredAmountUi: string
  isSubmitting: boolean
  actionError: string | null
  onSelectedTokenAMintAddressChange: (value: string) => void
  onTokenAAmountUiChange: (value: string) => void
  onTokenBMintAddressChange: (value: string) => void
  onTokenBRequiredAmountUiChange: (value: string) => void
  onSubmit: () => Promise<void>
  isWalletConnected: boolean
  onConnectWallet: () => void
}


export function MakeOfferPanel({
  tokenAccounts,
  selectedTokenAMintAddress,
  tokenAAmountUi,
  tokenBMintAddress,
  tokenBRequiredAmountUi,
  isSubmitting,
  actionError,
  onSelectedTokenAMintAddressChange,
  onTokenAAmountUiChange,
  onTokenBMintAddressChange,
  onTokenBRequiredAmountUiChange,
  onSubmit,
  isWalletConnected,
  onConnectWallet,
}: MakeOfferPanelProps) {
  const selectedTokenAccount = useMemo(
    () =>
      tokenAccounts.find(
        (tokenAccount) => tokenAccount.mintAddress === selectedTokenAMintAddress,
      ) ?? null,
    [selectedTokenAMintAddress, tokenAccounts],
  )

  const isAddressValid = (addr: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)

  const canSubmit = !isSubmitting &&
    selectedTokenAMintAddress.length > 0 &&
    tokenBMintAddress.length > 0 &&
    isAddressValid(tokenBMintAddress) &&
    tokenAAmountUi !== "" &&
    tokenBRequiredAmountUi !== "" &&
    Number(tokenAAmountUi) > 0 &&
    Number(tokenBRequiredAmountUi) > 0


  return (
    <div className="space-y-2 pt-1 sm:pt-1.5">
      {/* Mode Indicator */}
      <div className="flex items-center justify-between px-1 mb-1">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">P2P Limit Order</span>
        </div>
        <div className="group relative">
          <span className="text-[10px] text-zinc-500 cursor-help flex items-center gap-1 hover:text-zinc-300 transition-colors">
            <span className="text-[12px]">ⓘ</span> Protocol Info
          </span>
          <div className="absolute right-0 top-6 w-48 p-3 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[100] text-[9px] text-zinc-400 leading-relaxed translate-y-2 group-hover:translate-y-0">
            <p className="text-white font-bold mb-1 uppercase tracking-tighter">Secure Escrow</p>
            Tokens are locked in a program-managed vault. The trade completes automatically or you can <span className="text-emerald-500">cancel at any time</span>.
          </div>
        </div>
      </div>

      {/* You Pay Section */}
      <div className="peer-input-container transition-all">
        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 transition-colors ${!isWalletConnected ? 'text-zinc-600' : 'text-zinc-400'}`}>
          You Deposit
        </label>
        <div className="flex items-center gap-3">
          <input
            className={`peer-amount-input flex-1 min-w-0 text-4xl sm:text-5xl transition-opacity font-bold placeholder:text-zinc-800 focus:outline-none bg-transparent ${!isWalletConnected ? 'text-zinc-700/50' : 'text-white'}`}
            type="number"
            placeholder="0"
            value={tokenAAmountUi}
            onChange={(e) => onTokenAAmountUiChange(e.target.value)}
          />
          <div className="flex flex-col items-end gap-1.5 pt-1">
            <TokenSelect
              value={selectedTokenAMintAddress}
              options={tokenAccounts}
              onChange={onSelectedTokenAMintAddressChange}
              placeholder="Select"
              disabledOptions={[tokenBMintAddress]}
              isFaded={!isWalletConnected}
            />
            {isWalletConnected ? (
              selectedTokenAccount && (
                <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">Bal: {selectedTokenAccount.amountUi}</p>
              )
            ) : (
              <p className="text-[9px] text-zinc-700 font-bold uppercase mt-1 italic">Wallet not connected</p>
            )}
          </div>
        </div>
      </div>

      <div className="relative h-2 flex items-center justify-center -my-2">
        <div className="h-px bg-white/5 w-full" />
        <div
          className={`absolute bg-zinc-900 border border-white/10 rounded-2xl p-1.5 h-8 w-8 flex items-center justify-center z-10 shadow-2xl transition-all ${!isWalletConnected ? 'text-zinc-800 border-white/5' : 'text-zinc-500 border-white/10'}`}
        >
          <span className={`text-base ${!isWalletConnected ? 'text-zinc-800' : 'text-zinc-500'}`}>↓</span>
        </div>
      </div>

      {/* You Receive Section */}
      <div className="peer-input-container transition-all">
        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 transition-colors ${!isWalletConnected ? 'text-zinc-600' : 'text-zinc-400'}`}>
          You Receive
        </label>

        <div className="flex flex-col gap-2">
          <input
            className={`peer-amount-input w-full text-4xl sm:text-5xl transition-opacity font-bold placeholder:text-zinc-800 focus:outline-none bg-transparent ${!isWalletConnected ? 'text-zinc-700/50' : 'text-white'}`}
            type="number"
            placeholder="0"
            value={tokenBRequiredAmountUi}
            onChange={(e) => onTokenBRequiredAmountUiChange(e.target.value)}
          />

          <div className="space-y-1.5">
            <div className="relative">
              <input
                className={`w-full border rounded-2xl px-4 pr-12 py-3 text-[11px] font-mono transition-all focus:outline-none ${!isWalletConnected
                  ? 'bg-zinc-800/40 border-white/10 text-zinc-500 cursor-not-allowed'
                  : tokenBMintAddress.length === 0
                    ? 'bg-zinc-900 border-white/5 text-white placeholder:text-zinc-700 focus:border-white/20'
                    : isAddressValid(tokenBMintAddress)
                      ? 'bg-emerald-500/5 border-emerald-500/40 text-white'
                      : 'bg-red-500/5 border-red-500/40 text-white'
                  }`}
                placeholder="What token do you want? Paste its address here..."
                value={tokenBMintAddress}
                disabled={!isWalletConnected || isSubmitting}
                onChange={(e) => onTokenBMintAddressChange(e.target.value)}
              />
              {tokenBMintAddress.length > 0 && isAddressValid(tokenBMintAddress) && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              )}
              {tokenBMintAddress.length > 0 && !isAddressValid(tokenBMintAddress) && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-xs animate-bounce">
                  ⚠
                </div>
              )}
            </div>

            {/* Validity Text close to the input - reserved space to prevent layout shift */}
            <div className="h-3.5">
              {tokenBMintAddress.length > 0 && (
                <div className={`text-[9px] font-bold uppercase tracking-widest px-1 animate-in fade-in slide-in-from-top-1 duration-300 ${isAddressValid(tokenBMintAddress) ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                  {isAddressValid(tokenBMintAddress) ? '✓ Valid Token Address' : '✕ Invalid Token Address'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-[10px] text-red-500 font-bold text-center">
          {actionError}
        </div>
      )}

      {!isWalletConnected ? (
        <button
          onClick={onConnectWallet}
          className="w-full sm:mt-3 mt-2 bg-white text-black h-14 flex items-center justify-center rounded-[20px] font-black uppercase tracking-[0.15em] text-[11px] hover:bg-zinc-100 transition-all active:scale-[0.97] shadow-[0_0_40px_rgba(255,255,255,0.08)]"
        >
          Connect Wallet to Trade
        </button>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => void onSubmit()}
            disabled={!canSubmit}
            className="w-full sm:mt-3 mt-2 bg-white text-black h-14 flex items-center justify-center rounded-[20px] font-black uppercase tracking-[0.15em] text-[11px] hover:bg-zinc-100 transition-all active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_12px_44px_rgba(255,255,255,0.12)]"
          >
            {isSubmitting ? 'Securing in Vault...' : 'Create Swap Offer'}
          </button>
        </div>
      )}
    </div>
  )
}
