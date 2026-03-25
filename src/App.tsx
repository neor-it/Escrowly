import { useCallback, useEffect, useMemo, useState } from 'react'
import { EscrowFlowWidget } from './components/widget/escrowFlowWidget'
import { ToastStack, type ToastViewModel } from './components/ui/toast'
import { WalletModal } from './components/wallet/walletModal'
import { WalletAccountModal } from './components/wallet/walletAccountModal'
import {
  RPC_URL_STORAGE_KEY,
  TOAST_VISIBILITY_TIMEOUT_MS,
  UI_REFRESH_INTERVAL_MS,
  ZERO_UI_AMOUNT,
} from './constants/app'
import { MIN_AMOUNT_EXCLUSIVE } from './constants/validation'
import { useWalletConnection } from './hooks/useWalletConnection'
import { mapErrorCodeToMessage } from './lib/errorMapper'
import { createEscrowClient } from './services/escrowClient'
import { walletStandardService } from './services/walletStandardService'
import { getAppEnv } from './services/env'
import { fetchWalletTokenAccounts } from './services/tokenService'
import type { OfferViewModel, TokenAccountView } from './types/escrow'
import { OnboardingGrid } from './components/ui/onboardingGrid'

const EMPTY_TOKEN_ACCOUNTS: TokenAccountView[] = []

const EMPTY_OFFERS: OfferViewModel[] = []

type TransactionAction = 'create_order' | 'take_order' | null

type TransactionPhase =
  | 'idle'
  | 'awaiting_wallet'
  | 'submitting'
  | 'success'
  | 'error'

type TransactionProgressState = {
  phase: TransactionPhase
  action: TransactionAction
  message: string
}

const TOAST_ID_PREFIX = 'toast'
const TOAST_ID_RADIX = 36
const TOAST_RANDOM_PART_START_INDEX = 2

const INITIAL_TRANSACTION_PROGRESS: TransactionProgressState = {
  phase: 'idle',
  action: null,
  message: '',
}

function createToastId(): string {
  const timestampPart = Date.now().toString(TOAST_ID_RADIX)
  const randomPart = Math.random()
    .toString(TOAST_ID_RADIX)
    .slice(TOAST_RANDOM_PART_START_INDEX)

  return `${TOAST_ID_PREFIX}-${timestampPart}-${randomPart}`
}

function App() {
  const env = useMemo(() => getAppEnv(), [])

  const [solanaRpcUrl, setSolanaRpcUrl] = useState(() => {
    return localStorage.getItem(RPC_URL_STORAGE_KEY) || env.solanaRpcUrl
  })

  const walletConnection = useWalletConnection()

  useEffect(() => {
    walletStandardService.setRpcUrl(solanaRpcUrl)
  }, [solanaRpcUrl])

  const escrowClient = useMemo(
    () =>
      createEscrowClient({
        rpcUrl: solanaRpcUrl,
        programId: env.escrowProgramId,
      }),
    [env.escrowProgramId, solanaRpcUrl],
  )

  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [accountModalOpen, setAccountModalOpen] = useState(false)

  const [tokenAccounts, setTokenAccounts] =
    useState<TokenAccountView[]>(EMPTY_TOKEN_ACCOUNTS)
  const [isTokenAccountsLoading, setIsTokenAccountsLoading] = useState(false)
  const [tokenAccountsError, setTokenAccountsError] = useState<string | null>(null)

  const [selectedTokenAMintAddress, setSelectedTokenAMintAddress] = useState('')
  const [tokenAAmountUi, setTokenAAmountUi] = useState(ZERO_UI_AMOUNT)
  const [tokenBMintAddress, setTokenBMintAddress] = useState('')
  const [tokenBRequiredAmountUi, setTokenBRequiredAmountUi] = useState(ZERO_UI_AMOUNT)

  const [isMakeOfferSubmitting, setIsMakeOfferSubmitting] = useState(false)
  const [makeOfferError, setMakeOfferError] = useState<string | null>(null)

  const [offers, setOffers] = useState<OfferViewModel[]>(EMPTY_OFFERS)
  const [isOffersLoading, setIsOffersLoading] = useState(false)
  const [offersError, setOffersError] = useState<string | null>(null)

  const [isTakeOfferSubmitting, setIsTakeOfferSubmitting] = useState(false)

  const [toasts, setToasts] = useState<ToastViewModel[]>([])
  const [latestTransaction, setLatestTransaction] = useState<{
    signature: string
    explorerUrl: string
  } | null>(null)
  const [transactionProgress, setTransactionProgress] =
    useState<TransactionProgressState>(INITIAL_TRANSACTION_PROGRESS)

  const dismissToast = useCallback((toastId: string) => {
    setToasts((previousToasts) =>
      previousToasts.filter((toast) => toast.id !== toastId),
    )
  }, [])

  const addToast = useCallback(
    (toast: Omit<ToastViewModel, 'id'>) => {
      const toastId = createToastId()

      setToasts((previousToasts) => [
        {
          ...toast,
          id: toastId,
        },
        ...previousToasts,
      ])

      window.setTimeout(() => {
        dismissToast(toastId)
      }, TOAST_VISIBILITY_TIMEOUT_MS)
    },
    [dismissToast],
  )

  const refreshTokenAccounts = useCallback(async () => {
    const walletAccount = walletConnection.account

    if (!walletAccount) {
      setTokenAccounts(EMPTY_TOKEN_ACCOUNTS)
      setTokenAccountsError(null)
      return
    }

    setIsTokenAccountsLoading(true)
    setTokenAccountsError(null)

    try {
      const fetchedTokenAccounts = await fetchWalletTokenAccounts(
        solanaRpcUrl,
        walletAccount.address,
      )

      setTokenAccounts(fetchedTokenAccounts)

      if (fetchedTokenAccounts.length === 0) {
        setSelectedTokenAMintAddress('')
      } else {
        const firstTokenAccount = fetchedTokenAccounts[0]

        if (firstTokenAccount) {
          setSelectedTokenAMintAddress(firstTokenAccount.mintAddress)
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load wallet token accounts'

      setTokenAccounts(EMPTY_TOKEN_ACCOUNTS)
      setTokenAccountsError(message)
      addToast({
        kind: 'error',
        title: 'Token accounts loading failed',
        description: message,
      })
    } finally {
      setIsTokenAccountsLoading(false)
    }
  }, [addToast, solanaRpcUrl, walletConnection.account])

  const refreshOffers = useCallback(async () => {
    setIsOffersLoading(true)

    try {
      const offerListResult = await escrowClient.fetchOffers()

      setOffers(offerListResult.offers)

      if (offerListResult.errorCode) {
        setOffersError(
          offerListResult.errorMessage ??
            mapErrorCodeToMessage(offerListResult.errorCode),
        )

        return
      }

      setOffersError(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch offers'

      setOffers(EMPTY_OFFERS)
      setOffersError(message)
    } finally {
      setIsOffersLoading(false)
    }
  }, [escrowClient])

  useEffect(() => {
    void refreshTokenAccounts()
  }, [refreshTokenAccounts])

  useEffect(() => {
    void refreshOffers()

    const intervalId = window.setInterval(() => {
      void refreshOffers()
    }, UI_REFRESH_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [refreshOffers])

  const handleWalletConnect = useCallback(
    async (connectorId: string) => {
      await walletConnection.connect(connectorId)
      setWalletModalOpen(false)
    },
    [walletConnection.connect],
  )

  const handleWalletDisconnect = useCallback(async () => {
    await walletConnection.disconnect()
    setSelectedTokenAMintAddress('')
    setTokenAAmountUi(ZERO_UI_AMOUNT)
    setTokenBMintAddress('')
    setTokenBRequiredAmountUi(ZERO_UI_AMOUNT)
  }, [walletConnection.disconnect])


  const handleCreateOrder = useCallback(async () => {
    setMakeOfferError(null)

    if (!walletConnection.account) {
      setMakeOfferError('Connect a wallet before making an offer')
      return
    }

    const tokenAAmountNumber = tokenAAmountUi === '' ? 0 : Number(tokenAAmountUi)
    const tokenBAmountNumber = tokenBRequiredAmountUi === '' ? 0 : Number(tokenBRequiredAmountUi)

    if (
      !Number.isFinite(tokenAAmountNumber) ||
      !Number.isFinite(tokenBAmountNumber) ||
      tokenAAmountNumber <= MIN_AMOUNT_EXCLUSIVE ||
      tokenBAmountNumber <= MIN_AMOUNT_EXCLUSIVE
    ) {
      setMakeOfferError('Both token amounts must be greater than zero')
      return
    }

    if (selectedTokenAMintAddress.length === 0 || tokenBMintAddress.length === 0) {
      setMakeOfferError('Provide both Token A mint and Token B mint')
      return
    }


    setIsMakeOfferSubmitting(true)
    setTransactionProgress({
      phase: 'awaiting_wallet',
      action: 'create_order',
      message: 'Confirm the transaction in your wallet',
    })

    try {
      setTransactionProgress({
        phase: 'submitting',
        action: 'create_order',
        message: 'Finalizing your swap order...',
      })

      const makeOfferResult = await escrowClient.makeOffer({
        tokenAMintAddress: selectedTokenAMintAddress,
        tokenAAmountUi,
        tokenBMintAddress,
        tokenBRequiredAmountUi,
      })

      if (!makeOfferResult.success) {
        const message =
          makeOfferResult.errorMessage ??
          mapErrorCodeToMessage(makeOfferResult.errorCode)

        setMakeOfferError(message)
        setTransactionProgress({
          phase: 'error',
          action: 'create_order',
          message,
        })
        addToast({
          kind: 'error',
          title: 'Order creation failed',
          description: message,
        })

        return
      }

      setMakeOfferError(null)

      if (makeOfferResult.transaction) {
        setLatestTransaction(makeOfferResult.transaction)
        setTransactionProgress({
          phase: 'success',
          action: 'create_order',
          message: `Swap order created!`,
        })
        addToast({
          kind: 'success',
          title: 'Swap order placed',
          description: makeOfferResult.transaction.signature,
          action: (
            <a
              className="text-xs underline"
              href={makeOfferResult.transaction.explorerUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open in Solana Explorer
            </a>
          ),
        })
      }

      // Trigger refetch for both logic and balances
      await Promise.all([refreshOffers(), refreshTokenAccounts()]);
    } finally {
      setIsMakeOfferSubmitting(false)
    }
  }, [
    addToast,
    escrowClient,
    refreshOffers,
    selectedTokenAMintAddress,
    tokenAAmountUi,
    tokenBMintAddress,
    tokenBRequiredAmountUi,
    walletConnection.account,
  ])

  const handleTakeOrder = useCallback(
    async (offerAddress: string) => {
      setIsTakeOfferSubmitting(true)
      setTransactionProgress({
        phase: 'awaiting_wallet',
        action: 'take_order',
        message: 'Confirm the transaction in your wallet',
      })

      try {
        setTransactionProgress({
          phase: 'submitting',
          action: 'take_order',
          message: 'Processing your swap...',
        })

        const takeOfferResult = await escrowClient.takeOffer({ offerAddress })

        if (!takeOfferResult.success) {
          const message =
            takeOfferResult.errorMessage ??
            mapErrorCodeToMessage(takeOfferResult.errorCode)

          setTransactionProgress({
            phase: 'error',
            action: 'take_order',
            message,
          })
          addToast({
            kind: 'error',
            title: 'Swap failed',
            description: message,
          })

          return
        }

        if (takeOfferResult.transaction) {
          // Optimistically remove the taken offer from the list
          setOffers((prevOffers) => prevOffers.filter(o => o.offerAddress !== offerAddress));
          
          setLatestTransaction(takeOfferResult.transaction)
          setTransactionProgress({
            phase: 'success',
            action: 'take_order',
            message: `Swap complete!`,
          })
          addToast({
            kind: 'success',
            title: 'Swap successful',
            description: takeOfferResult.transaction.signature,
            action: (
              <a
                className="text-xs underline"
                href={takeOfferResult.transaction.explorerUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open in Solana Explorer
              </a>
            ),
          })
        }

        // Trigger refetch for both logic and balances
        await Promise.all([refreshOffers(), refreshTokenAccounts()]);
      } finally {
        setIsTakeOfferSubmitting(false)
      }
    },
    [addToast, escrowClient, refreshOffers],
  )

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center sm:p-4 w-full overflow-x-hidden">
        <div className="flex-1 flex items-start sm:items-center justify-center sm:py-4 w-full">
          <EscrowFlowWidget
            walletAccount={walletConnection.account}
            walletConnectError={walletConnection.connectError}
            onOpenWalletModal={() => setWalletModalOpen(true)}
            onOpenAccountModal={() => setAccountModalOpen(true)}
            tokenAccounts={tokenAccounts}
            selectedTokenAMintAddress={selectedTokenAMintAddress}
            tokenAAmountUi={tokenAAmountUi}
            tokenBMintAddress={tokenBMintAddress}
            tokenBRequiredAmountUi={tokenBRequiredAmountUi}
            isMakeOfferSubmitting={isMakeOfferSubmitting}
            makeOfferError={makeOfferError}
            onSelectedTokenAMintAddressChange={setSelectedTokenAMintAddress}
            onTokenAAmountUiChange={setTokenAAmountUi}
            onTokenBMintAddressChange={setTokenBMintAddress}
            onTokenBRequiredAmountUiChange={setTokenBRequiredAmountUi}
            onCreateOrder={handleCreateOrder}
            orders={offers}
            isOrdersLoading={isOffersLoading}
            isTakeOrderSubmitting={isTakeOfferSubmitting}
            ordersError={offersError}
            onRefreshOrders={refreshOffers}
            onTakeOrder={handleTakeOrder}
            rpcUrl={solanaRpcUrl}
            programId={env.escrowProgramId}

            isTokenAccountsLoading={isTokenAccountsLoading}
            tokenAccountsError={tokenAccountsError}
            latestTransaction={latestTransaction}
            transactionProgress={transactionProgress}
            onClearTransactionProgress={() =>
              setTransactionProgress(INITIAL_TRANSACTION_PROGRESS)
            }
          />
        </div>
        
        <OnboardingGrid />
      </div>

      <WalletModal
        open={walletModalOpen}
        connectors={walletConnection.connectors}
        isConnecting={walletConnection.isConnecting}
        onClose={() => setWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />

      <WalletAccountModal
        open={accountModalOpen}
        account={walletConnection.account}
        currentRpc={solanaRpcUrl}
        onClose={() => setAccountModalOpen(false)}
        onDisconnect={handleWalletDisconnect}
        onRpcSave={(newRpc) => {
          localStorage.setItem(RPC_URL_STORAGE_KEY, newRpc)
          setSolanaRpcUrl(newRpc)
          addToast({
            kind: 'success',
            title: 'RPC Updated',
            description: `Now using ${newRpc}`,
          })
        }}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}

export default App
