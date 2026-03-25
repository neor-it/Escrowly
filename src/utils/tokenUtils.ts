import { address, type Address, getProgramDerivedAddress, getAddressEncoder } from '@solana/kit';

export const TOKEN_PROGRAM_ID = address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const ASSOCIATED_TOKEN_PROGRAM_ID = address('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

/**
 * Derives the Associated Token Account address
 */
export async function getAssociatedTokenAddress(
  mint: Address,
  owner: Address,
  tokenProgramId: Address = TOKEN_PROGRAM_ID
): Promise<Address> {
  const encoder = getAddressEncoder();
  const [ata] = await getProgramDerivedAddress({
    programAddress: ASSOCIATED_TOKEN_PROGRAM_ID,
    seeds: [
      encoder.encode(owner),
      encoder.encode(tokenProgramId),
      encoder.encode(mint),
    ],
  });
  return ata;
}

/**
 * Formats a token amount to a human-readable string without scientific notation.
 */
export function formatAmount(amount: string | number | bigint, decimals: number = 9): string {
  const val = typeof amount === 'bigint' ? Number(amount) / (10 ** decimals) : 
              typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(val)) return '0';
  if (val === 0) return '0';
  
  // If amount is positive but smaller than our display threshold
  if (val > 0 && val < 0.000001) {
    return '< 0.000001';
  }
  
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 6,
    useGrouping: true,
  }).format(val);
}

/**
 * Returns the full amount as a string without threshold for tooltip.
 */
export function formatFullAmount(amount: string | number | bigint, decimals: number = 9): string {
  const val = typeof amount === 'bigint' ? Number(amount) / (10 ** decimals) : 
              typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(val)) return '0';
  
  return val.toLocaleString('en-US', {
    maximumFractionDigits: 20, // High precision
    useGrouping: false,
  });
}

/**
 * Simple token metadata map for Devnet demo.
 */
export const TOKEN_MAP: Record<string, { symbol: string; name: string; icon?: string }> = {
  '4g5EN9Sk7wEcZqfjdjDtvq7T9u5YUrBKTe23fVJoL8yy': { symbol: 'ESCROW', name: 'Escrowly Governance' },
  // These will be filled dynamically or from env in a real app, 
  // but we can add the ones from the user's screenshots if we find them.
};

export function getTokenSymbol(mint: string): string {
  return TOKEN_MAP[mint]?.symbol || mint.slice(0, 4) + '...' + mint.slice(-4);
}
