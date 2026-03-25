import {
  DEFAULT_ESCROW_PROGRAM_ID,
  DEFAULT_SOLANA_RPC_URL,
} from '../constants/app'

export type AppEnv = {
  solanaRpcUrl: string
  escrowProgramId: string
}

export function getAppEnv(): AppEnv {
  const solanaRpcUrl =
    import.meta.env.VITE_SOLANA_RPC_URL?.trim() || DEFAULT_SOLANA_RPC_URL

  const escrowProgramId =
    import.meta.env.VITE_ESCROW_PROGRAM_ID?.trim() || DEFAULT_ESCROW_PROGRAM_ID

  return {
    solanaRpcUrl,
    escrowProgramId,
  }
}
