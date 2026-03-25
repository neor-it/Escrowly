import { useState, useMemo } from 'react'
import type { OfferViewModel } from '../../types/escrow'
import { formatAmount, formatFullAmount, getTokenSymbol } from '../../utils/tokenUtils'

type OpenOffersPanelProps = {
  offers: OfferViewModel[]
  isLoading: boolean
  isTaking: boolean
  listError: string | null
  onRefresh: () => Promise<void>
  onTakeOrder: (offerAddress: string) => Promise<void>
  onConnectWallet: () => void
  connectedAddress?: string
}

export function OpenOffersPanel({
  offers,
  isLoading,
  isTaking,
  listError,
  onRefresh,
  onTakeOrder,
  onConnectWallet,
  connectedAddress,
}: OpenOffersPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyMine, setShowOnlyMine] = useState(false)

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = 
        offer.tokenAMintAddress.toLowerCase().includes(q) ||
        offer.tokenBMintAddress.toLowerCase().includes(q) ||
        getTokenSymbol(offer.tokenAMintAddress).toLowerCase().includes(q) ||
        getTokenSymbol(offer.tokenBMintAddress).toLowerCase().includes(q)
      
      const matchesMine = !showOnlyMine || offer.makerAddress === connectedAddress

      return matchesSearch && matchesMine
    })
  }, [offers, searchQuery, showOnlyMine, connectedAddress])

  return (
    <div className="relative flex flex-col h-full">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a]/98 backdrop-blur-xl pt-4 sm:pt-7 pb-4 border-b border-white/5 space-y-3 mb-2 w-full">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Liquidity</span>
          <button 
            onClick={() => void onRefresh()}
            disabled={isLoading}
            className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md"
          >
            {isLoading ? 'Fetching...' : 'Refresh'}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="relative group">
            <input 
              type="text"
              placeholder="Search by token or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-3.5 text-[11px] font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/20 transition-all shadow-2xl"
            />
            <div className="absolute right-5 top-3.5 text-[11px] opacity-40 group-focus-within:opacity-100 transition-opacity">
              🔍
            </div>
          </div>
          
          {connectedAddress ? (
            <div className="flex items-center gap-2 px-1">
              <button
                onClick={() => setShowOnlyMine(!showOnlyMine)}
                className={`h-4 w-8 rounded-full transition-all relative ${showOnlyMine ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-zinc-800 border border-white/5'}`}
              >
                <div className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white transition-all ${showOnlyMine ? 'translate-x-4' : ''}`} />
              </button>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">My Orders Only</span>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 p-2 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-tight">Connect to track your orders</span>
                </div>
                <button 
                  onClick={onConnectWallet}
                  className="text-[8px] font-black bg-white text-black px-3 py-1 rounded-lg uppercase shadow-lg shadow-white/5 active:scale-90 transition-all"
                >
                  Connect
                </button>
            </div>
          )}
        </div>
      </div>

      {listError && (
        <div className="my-4 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-[10px] text-red-500 text-center font-bold">
          {listError}
        </div>
      )}

      <div className="flex-1 space-y-3 pt-2 pb-6">
        {filteredOffers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="text-3xl opacity-20">📭</div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-tighter">No matching offers</p>
              <p className="text-[10px] text-zinc-700 italic">Try a different search or refresh the list</p>
            </div>
          </div>
        ) : (
          filteredOffers.map((offer) => {
            const isMine = offer.makerAddress === connectedAddress
            
            return (
              <div key={offer.offerAddress} className="bg-zinc-900/40 border border-white/5 rounded-[24px] p-5 space-y-5 hover:border-white/10 transition-all shadow-lg hover:shadow-2xl group relative overflow-hidden backdrop-blur-sm sm:mx-0">
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 bg-white/5 rounded-full border border-white/5 flex items-center justify-center">
                        <span className="text-[8px]">👤</span>
                    </div>
                    <p className="text-[10px] font-mono font-bold text-zinc-400 tracking-tight">
                      {isMine ? 'YOU' : `${offer.makerAddress.slice(0, 4)}...${offer.makerAddress.slice(-4)}`}
                    </p>
                  </div>
                  {isMine && (
                    <div className="bg-emerald-500 text-[8px] font-black text-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      Your Order
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 relative z-10">
                  <div className="flex flex-col sm:flex-row items-stretch gap-3">
                    {/* Token A - Give */}
                    <div className="flex-1 bg-white/5 p-4 rounded-[24px] border border-white/5 flex flex-col justify-between gap-3">
                      <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em]">You Give</span>
                      <div className="flex flex-col gap-1 overflow-hidden">
                          <span className="text-lg font-black tracking-tight text-white truncate" title={formatFullAmount(offer.requiredAmount)}>
                            {formatAmount(offer.requiredAmount)}
                          </span>
                          <a 
                            href={`https://solscan.io/token/${offer.tokenBMintAddress}?cluster=devnet`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-fit text-[9px] font-bold text-zinc-400 bg-black/40 px-2.5 py-1 rounded-lg hover:text-white hover:bg-black/60 transition-all font-mono border border-white/5"
                          >
                            {getTokenSymbol(offer.tokenBMintAddress)}
                          </a>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center justify-center text-zinc-800 text-lg font-black transition-transform group-hover:scale-125">→</div>
                    <div className="sm:hidden flex items-center justify-center -my-2 opacity-20 text-lg">↓</div>

                    {/* Token B - Get */}
                    <div className="flex-1 bg-emerald-500/5 p-4 rounded-[24px] border border-emerald-500/10 flex flex-col justify-between gap-3">
                      <span className="block text-[8px] font-bold text-emerald-500/60 uppercase tracking-[0.2em]">You Get</span>
                      <div className="flex flex-col gap-1 overflow-hidden">
                          <span className="text-lg font-black tracking-tight text-emerald-400 truncate" title={formatFullAmount(offer.offeredAmount)}>
                            {formatAmount(offer.offeredAmount)}
                          </span>
                          <a 
                             href={`https://solscan.io/token/${offer.tokenAMintAddress}?cluster=devnet`}
                             target="_blank"
                             rel="noreferrer"
                             className="inline-flex w-fit text-[9px] font-bold text-emerald-500/40 bg-black/40 px-2.5 py-1 rounded-lg hover:text-emerald-300 hover:bg-black/60 transition-all font-mono border border-emerald-500/10"
                          >
                            {getTokenSymbol(offer.tokenAMintAddress)}
                          </a>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => void onTakeOrder(offer.offerAddress)}
                    disabled={isTaking || isMine}
                    className={`w-full h-14 flex items-center justify-center rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] transition-all relative z-10 ${
                      isMine
                        ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-white/5'
                        : 'bg-white text-black hover:bg-zinc-100 active:scale-[0.97] shadow-xl'
                    }`}
                  >
                    {isTaking ? 'Processing...' : isMine ? 'Your Order' : 'Accept Swap'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
