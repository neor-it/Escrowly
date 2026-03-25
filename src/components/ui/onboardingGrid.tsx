export function OnboardingGrid() {
  const steps = [
    {
      icon: '🛡️',
      title: 'Secure Locking',
      description: 'Your tokens are locked in a double-audit secure on-chain program. Only you or a valid counterparty can trigger a release.'
    },
    {
      icon: '🤝',
      title: 'Peer Discovery',
      description: 'Your order is published to the global escrow marketplace. Anyone with the required tokens can see and accept your swap.'
    },
    {
      icon: '⚡',
      title: 'Atomic Swap',
      description: 'The moment a peer accepts, the exchange happens instantly. Both parties receive their tokens in a single, atomic transaction.'
    }
  ];

  return (
    <div className="w-full max-w-[680px] mt-12 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-3 mb-8 justify-center">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">How it works</span>
        <div className="h-px bg-gradient-to-r from-white/10 via-white/10 to-transparent flex-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-[24px] blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/5 p-6 rounded-[24px] h-full flex flex-col gap-4 hover:border-white/10 transition-all duration-300">
              <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110 origin-left">
                {step.icon}
              </span>
              <div className="space-y-2">
                <h3 className="text-[11px] font-black text-white uppercase tracking-wider">{step.title}</h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-2 bg-emerald-500/5 py-3 px-6 rounded-full border border-emerald-500/10 w-fit mx-auto">
        <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">Guaranteed by Solana Escrow Engine</span>
        <span className="text-xs">✅</span>
      </div>
    </div>
  );
}
