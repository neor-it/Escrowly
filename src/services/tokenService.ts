import { createSolanaRpc, address } from '@solana/kit'
import type { TokenAccountView } from '../types/escrow'

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'

export async function fetchWalletTokenAccounts(
  rpcUrl: string,
  ownerAddress: string,
): Promise<TokenAccountView[]> {
  const rpc = createSolanaRpc(rpcUrl)
  
  const response = await rpc.getTokenAccountsByOwner(address(ownerAddress), { 
    programId: address(TOKEN_PROGRAM_ID) 
  }, { 
    encoding: 'jsonParsed' 
  }).send();

  const records = (response.value as any[]) || []

  return records.map((record) => ({
    tokenAccountAddress: record.pubkey,
    mintAddress: record.account.data.parsed.info.mint,
    amountRaw: record.account.data.parsed.info.tokenAmount.amount,
    amountUi: record.account.data.parsed.info.tokenAmount.uiAmountString,
    decimals: record.account.data.parsed.info.tokenAmount.decimals,
  }))
}

