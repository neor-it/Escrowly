import type { WalletAccountView } from '../../types/escrow'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

type WalletPanelProps = {
  account: WalletAccountView | null
  connectError: string | null
  onOpenModal: () => void
  onDisconnect: () => Promise<void>
}

export function WalletPanel({
  account,
  connectError,
  onOpenModal,
  onDisconnect,
}: WalletPanelProps) {
  const connectionStateLabel = account ? 'Connected' : 'Not connected'

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-card to-sky-50/35">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold md:text-xl">Wallet Connection</h2>
            <p className="text-xs text-muted-foreground md:text-sm">
              Custom wallet modal with auto-detected Wallet Standard connectors.
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              account
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {connectionStateLabel}
          </span>
        </div>

        {account ? (
          <div className="rounded-xl border border-border bg-muted px-3 py-2.5 text-sm">
            <p className="font-semibold">{account.walletName}</p>
            <p className="mono mt-1 text-xs text-muted-foreground">{account.shortAddress}</p>
          </div>
        ) : (
          <p className="rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            Wallet is not connected.
          </p>
        )}

        {connectError ? (
          <p className="rounded-xl border border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {connectError}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={onOpenModal}>Connect</Button>
          <Button
            variant="outline"
            disabled={!account}
            onClick={() => void onDisconnect()}
          >
            Disconnect
          </Button>
        </div>
      </div>
    </Card>
  )
}
