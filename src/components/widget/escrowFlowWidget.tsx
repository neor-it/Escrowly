import { useState } from 'react'
import type {
  OfferViewModel,
  TokenAccountView,
  WalletAccountView,
} from '../../types/escrow'
import { MakeOfferPanel } from '../offers/makeOfferPanel'
import { OpenOffersPanel } from '../offers/openOffersPanel'

type TransactionProgressState = {
  phase: 'idle' | 'awaiting_wallet' | 'submitting' | 'success' | 'error'
  action: 'create_order' | 'take_order' | null
  message: string
}

type EscrowFlowWidgetProps = {
  walletAccount: WalletAccountView | null
  walletConnectError: string | null
  onOpenWalletModal: () => void
  onOpenAccountModal: () => void
  tokenAccounts: TokenAccountView[]
  selectedTokenAMintAddress: string
  tokenAAmountUi: string
  tokenBMintAddress: string
  tokenBRequiredAmountUi: string
  isMakeOfferSubmitting: boolean
  makeOfferError: string | null
  onSelectedTokenAMintAddressChange: (value: string) => void
  onTokenAAmountUiChange: (value: string) => void
  onTokenBMintAddressChange: (value: string) => void
  onTokenBRequiredAmountUiChange: (value: string) => void
  onCreateOrder: () => Promise<void>
  orders: OfferViewModel[]
  isOrdersLoading: boolean
  isTakeOrderSubmitting: boolean
  ordersError: string | null
  onRefreshOrders: () => Promise<void>
  onTakeOrder: (offerAddress: string) => Promise<void>
  rpcUrl?: string
  programId?: string
  isTokenAccountsLoading?: boolean
  tokenAccountsError?: string | null
  latestTransaction?: { signature: string; explorerUrl: string } | null
  transactionProgress: TransactionProgressState
  onClearTransactionProgress: () => void
}

export function EscrowFlowWidget({
  walletAccount,
  onOpenWalletModal,
  onOpenAccountModal,
  tokenAccounts,
  selectedTokenAMintAddress,
  tokenAAmountUi,
  tokenBMintAddress,
  tokenBRequiredAmountUi,
  isMakeOfferSubmitting,
  makeOfferError,
  onSelectedTokenAMintAddressChange,
  onTokenAAmountUiChange,
  onTokenBMintAddressChange,
  onTokenBRequiredAmountUiChange,
  onCreateOrder,
  orders,
  isOrdersLoading,
  isTakeOrderSubmitting,
  ordersError,
  onRefreshOrders,
  onTakeOrder,
  latestTransaction,
  transactionProgress,
  onClearTransactionProgress,
}: EscrowFlowWidgetProps) {
  const [activeTab, setActiveTab] = useState<'swap' | 'browse'>('swap')

  return (
    <div className="w-full sm:max-w-[440px] sm:space-y-6 space-y-0">
        {/* Navigation Bar */}
        <div className="flex items-center justify-center gap-1 bg-zinc-900/40 p-1.5 sm:rounded-full rounded-none w-full sm:w-fit mx-auto border-b sm:border border-white/5 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('swap')}
            className={`px-6 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${
              activeTab === 'swap' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'
            }`}
          >
            CREATE
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${
              activeTab === 'browse' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'
            }`}
          >
            ORDERS
          </button>
        </div>

        {/* Main Widget Card */}
        <div className="peer-widget overflow-visible flex flex-col min-h-fit transition-all duration-300 w-full sm:bg-zinc-900/40 sm:backdrop-blur-xl sm:border sm:border-white/5 sm:rounded-[32px] sm:shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">Escrowly</h1>
            <div className="flex items-center gap-3">

              
              {walletAccount ? (
                <button 
                  onClick={onOpenAccountModal}
                  className="text-[10px] font-bold text-zinc-400 bg-white/5 px-2.5 py-1.5 rounded-full flex items-center gap-2 border border-white/5 hover:bg-white/10 transition-all active:scale-95"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  {walletAccount.shortAddress}
                </button>
              ) : (
                <button 
                  onClick={onOpenWalletModal}
                  className="text-xs font-bold text-white bg-white/5 px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 sm:px-6 sm:pb-6 px-4 pb-6 h-[520px] sm:max-h-[520px] max-h-[75vh] overflow-y-auto overflow-x-hidden flex flex-col relative custom-scrollbar">
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-20 sm:hidden" />
            {activeTab === 'swap' ? (
              <MakeOfferPanel
                tokenAccounts={tokenAccounts}
                selectedTokenAMintAddress={selectedTokenAMintAddress}
                tokenAAmountUi={tokenAAmountUi}
                tokenBMintAddress={tokenBMintAddress}
                tokenBRequiredAmountUi={tokenBRequiredAmountUi}
                isSubmitting={isMakeOfferSubmitting}
                actionError={transactionProgress.phase === 'error' ? null : makeOfferError}
                onSelectedTokenAMintAddressChange={onSelectedTokenAMintAddressChange}
                onTokenAAmountUiChange={onTokenAAmountUiChange}
                onTokenBMintAddressChange={onTokenBMintAddressChange}
                onTokenBRequiredAmountUiChange={onTokenBRequiredAmountUiChange}
                onSubmit={onCreateOrder}
                isWalletConnected={!!walletAccount}
                onConnectWallet={onOpenWalletModal}
              />
            ) : (
              <div className="flex-1 pr-1 scroll-smooth">
                <OpenOffersPanel
                  offers={orders}
                  isLoading={isOrdersLoading}
                  isTaking={isTakeOrderSubmitting}
                  listError={transactionProgress.phase === 'error' ? null : ordersError}
                  onRefresh={onRefreshOrders}
                  onTakeOrder={onTakeOrder}
                  onConnectWallet={onOpenWalletModal}
                  connectedAddress={walletAccount?.address}
                />
              </div>
            )}
          </div>
          
          {/* Progress / Status Footer */}
          {transactionProgress.phase !== 'idle' && (
            <div className={`px-6 py-6 border-t border-white/5 transition-all sm:rounded-b-[32px] ${
              transactionProgress.phase === 'error' ? 'bg-red-500/10 text-red-500' : 
              transactionProgress.phase === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5'
            }`}>
              <div className="flex flex-col gap-4 text-left relative">
                <div className="flex items-start justify-between gap-8">
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest">
                      {transactionProgress.phase === 'success' ? 'Order Placed!' : 
                       transactionProgress.phase === 'error' ? 'Failed' : 
                       'Processing...'}
                    </h3>
                    <p className="text-[10px] text-white/40 leading-relaxed italic pr-4">
                      {transactionProgress.phase === 'success' 
                        ? 'Your swap order is now live on the blockchain.' 
                        : transactionProgress.message}
                    </p>
                  </div>
                  
                  {transactionProgress.phase !== 'submitting' && (
                    <button 
                      onClick={onClearTransactionProgress} 
                      className="shrink-0 h-7 px-3 bg-white/5 hover:bg-white/10 rounded-full transition-all font-bold text-[9px] uppercase tracking-tighter border border-white/5 flex items-center justify-center cursor-pointer active:scale-90"
                    >
                      Done
                    </button>
                  )}
                </div>
                
                {transactionProgress.phase === 'success' && latestTransaction && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-[9px] bg-black/30 px-3 py-2 rounded-xl border border-white/5 font-mono">
                      <span className="opacity-30 uppercase font-bold tracking-tighter">ID</span>
                      <span className="font-bold opacity-60">
                        {latestTransaction.signature.slice(0, 12)}...{latestTransaction.signature.slice(-12)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                       <a 
                        href={latestTransaction.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-bold uppercase tracking-tight transition-all"
                      >
                        Explorer
                      </a>
                      <a 
                        href={`https://solscan.io/tx/${latestTransaction.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-black border border-emerald-400 rounded-xl text-[9px] font-bold uppercase tracking-tight transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.02] active:scale-95"
                      >
                        Solscan
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-zinc-700 font-bold tracking-[0.2em] uppercase">
          Solana Escrow Engine
        </p>
    </div>
  )
}
