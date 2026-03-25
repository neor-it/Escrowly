import {
  getAddressCodec,
  getU64Codec,
  getU8Codec,
  getStructCodec,
  getBytesCodec,
  fixCodecSize,
  getBase64Encoder,
  getBase64Decoder,
  getBase58Decoder,
} from '@solana/kit';

export const decodeBase64 = (base64: string) => getBase64Encoder().encode(base64);
export const encodeBase64 = (bytes: Uint8Array) => getBase64Decoder().decode(bytes);
export const encodeBase58 = (bytes: Uint8Array) => getBase58Decoder().decode(bytes);

/**
 * Calculates Anchor discriminator for an account or instruction
 * @param name The name of the account or instruction (e.g., "Offer" or "make_offer")
 * @param type "account" or "instruction"
 */
export function getAnchorDiscriminator(name: string, type: 'account' | 'instruction'): Uint8Array {
  // These are the ACTUAL discriminators from the escrow.json
  if (name === 'Offer' && type === 'account') {
    return new Uint8Array([215, 88, 60, 71, 170, 162, 73, 229]);
  }
  if (name === 'make_offer' && type === 'instruction') {
    return new Uint8Array([214, 98, 97, 35, 59, 12, 44, 178]);
  }
  if (name === 'take_offer' && type === 'instruction') {
    return new Uint8Array([128, 156, 242, 207, 237, 192, 103, 240]);
  }
  
  throw new Error(`Unknown Anchor discriminator requested: ${name} (${type})`);
}

export const offerAccountCodec = getStructCodec([
  ['discriminator', fixCodecSize(getBytesCodec(), 8)],
  ['id', getU64Codec()],
  ['maker', getAddressCodec()],
  ['token_mint_a', getAddressCodec()],
  ['token_mint_b', getAddressCodec()],
  ['token_b_wanted_amount', getU64Codec()],
  ['bump', getU8Codec()],
]);

export const makeOfferInstructionCodec = getStructCodec([
  ['discriminator', fixCodecSize(getBytesCodec(), 8)],
  ['id', getU64Codec()],
  ['token_a_offered_amount', getU64Codec()],
  ['token_b_wanted_amount', getU64Codec()],
]);

export const takeOfferInstructionCodec = getStructCodec([
  ['discriminator', fixCodecSize(getBytesCodec(), 8)],
]);

/**
 * Partial SPL Token Account codec to extract mint and balance
 */
export const splTokenAccountCodec = getStructCodec([
  ['mint', getAddressCodec()],
  ['owner', getAddressCodec()],
  ['amount', getU64Codec()],
  // ... excluding other fields for brevity as we only need balance
]);

