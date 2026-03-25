import type { EscrowClientErrorCode } from '../types/escrow'

export function mapErrorCodeToMessage(code: EscrowClientErrorCode | null): string {
  if (code === null) {
    return ''
  }

  if (code === 'IDL_REQUIRED') {
    return 'Escrow IDL is not configured yet. Please add the official IDL and rebuild instruction coders.'
  }

  if (code === 'USER_REJECTED') {
    return 'Transaction was rejected in wallet.'
  }

  if (code === 'INSUFFICIENT_BALANCE') {
    return 'Insufficient balance for this operation.'
  }

  if (code === 'STALE_BLOCKHASH') {
    return 'Stale blockhash detected. Try again.'
  }

  if (code === 'WALLET_NOT_CONNECTED') {
    return 'Connect a wallet first.'
  }

  if (code === 'UNSUPPORTED_WALLET') {
    return 'Selected wallet does not support required Solana features.'
  }

  if (code === 'NETWORK_ERROR') {
    return 'Network error. Check Devnet RPC availability.'
  }

  return 'Unknown error. Please retry.'
}
