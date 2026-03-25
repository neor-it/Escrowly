export type WalletConnectorView = {
  id: string
  name: string
  icon: string | null
  isInstalled: boolean
  supportsSolana: boolean
}

export type WalletAccountView = {
  address: string
  shortAddress: string
  walletName: string
}

export type TokenAccountView = {
  tokenAccountAddress: string
  mintAddress: string
  amountRaw: string
  amountUi: string
  decimals: number
}

export type OfferViewModel = {
  offerAddress: string
  makerAddress: string
  tokenAMintAddress: string
  tokenBMintAddress: string
  offeredAmount: string
  requiredAmount: string
  createdAtSlot: number | null
}

export type MakeOfferPayload = {
  tokenAMintAddress: string
  tokenAAmountUi: string
  tokenBMintAddress: string
  tokenBRequiredAmountUi: string
}

export type TakeOfferPayload = {
  offerAddress: string
}

export type TransactionResult = {
  signature: string
  explorerUrl: string
}

export type EscrowClientErrorCode =
  | 'IDL_REQUIRED'
  | 'USER_REJECTED'
  | 'INSUFFICIENT_BALANCE'
  | 'STALE_BLOCKHASH'
  | 'WALLET_NOT_CONNECTED'
  | 'UNSUPPORTED_WALLET'
  | 'NETWORK_ERROR'
  | 'UNKNOWN'

export type EscrowActionResult = {
  success: boolean
  errorCode: EscrowClientErrorCode | null
  errorMessage: string | null
  transaction: TransactionResult | null
}

export type OfferListResult = {
  offers: OfferViewModel[]
  errorCode: EscrowClientErrorCode | null
  errorMessage: string | null
}

export interface EscrowClient {
  makeOffer(payload: MakeOfferPayload): Promise<EscrowActionResult>
  takeOffer(payload: TakeOfferPayload): Promise<EscrowActionResult>
  fetchOffers(): Promise<OfferListResult>
}
