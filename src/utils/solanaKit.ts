import { 
  createSolanaRpc,
  address,
  type Address,
  getProgramDerivedAddress,
  getAddressEncoder,
  getU64Encoder
} from '@solana/kit';

export { address };
export type { Address };

export const DEVNET_RPC_URL = 'https://api.devnet.solana.com';

export const rpc = createSolanaRpc(DEVNET_RPC_URL);

/**
 * Derives the Offer PDA
 */
export async function deriveOfferAddress(
  programId: Address,
  maker: Address,
  id: bigint
) {
  const idEncoder = getU64Encoder();
  const idBytes = idEncoder.encode(id);
  const addrEncoder = getAddressEncoder();
  
  const [addr] = await getProgramDerivedAddress({
    programAddress: programId,
    seeds: [
      new TextEncoder().encode('offer'),
      addrEncoder.encode(maker),
      idBytes,
    ],
  });
  return addr;
}
