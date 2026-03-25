import { useCallback, useEffect, useMemo, useState } from 'react'
import type { WalletAccountView, WalletConnectorView } from '../types/escrow'
import { walletStandardService } from '../services/walletStandardService'

type WalletConnectionState = {
  connectors: WalletConnectorView[]
  account: WalletAccountView | null
  isConnecting: boolean
  connectError: string | null
}

const INITIAL_STATE: WalletConnectionState = {
  connectors: [],
  account: null,
  isConnecting: false,
  connectError: null,
}

export function useWalletConnection() {
  const [state, setState] = useState<WalletConnectionState>(INITIAL_STATE)

  useEffect(() => {
    const unsubscribe = walletStandardService.subscribe((connectors) => {
      setState((previousState) => ({
        ...previousState,
        connectors,
        account: walletStandardService.getCurrentAccount(),
      }))
    })

    return unsubscribe
  }, [])

  const connect = useCallback(async (connectorId: string) => {
    setState((previousState) => ({
      ...previousState,
      isConnecting: true,
      connectError: null,
    }))

    try {
      const account = await walletStandardService.connect(connectorId)

      setState((previousState) => ({
        ...previousState,
        account,
        isConnecting: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect wallet'

      setState((previousState) => ({
        ...previousState,
        connectError: message,
        isConnecting: false,
      }))
    }
  }, [])

  const disconnect = useCallback(async () => {
    await walletStandardService.disconnect()

    setState((previousState) => ({
      ...previousState,
      account: null,
      connectError: null,
    }))
  }, [])

  return useMemo(
    () => ({
      connectors: state.connectors,
      account: state.account,
      isConnecting: state.isConnecting,
      connectError: state.connectError,
      connect,
      disconnect,
    }),
    [connect, disconnect, state],
  )
}
