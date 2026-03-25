import {
  address,
  type Address,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstruction,
  pipe,
  compileTransaction,
  getBase64EncodedWireTransaction,
  createSolanaRpc,
} from '@solana/kit';
import {
  getU8Codec,
  getU32Codec,
  getU64Codec,
  getStructCodec,
} from '@solana/kit';
import {
  type EscrowActionResult,
  type EscrowClient,
  type EscrowClientErrorCode,
  type MakeOfferPayload,
  type OfferListResult,
  type TakeOfferPayload,
  type OfferViewModel,
} from '../types/escrow';
import { walletStandardService } from './walletStandardService';
import {
  getAnchorDiscriminator,
  offerAccountCodec,
  makeOfferInstructionCodec,
  takeOfferInstructionCodec,
  decodeBase64,
  splTokenAccountCodec,
} from '../utils/anchor';
import { deriveOfferAddress } from '../utils/solanaKit';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '../utils/tokenUtils';

const setComputeUnitLimitCodec = getStructCodec([
  ['instruction', getU8Codec()],
  ['units', getU32Codec()],
]);

const setComputeUnitPriceCodec = getStructCodec([
  ['instruction', getU8Codec()],
  ['microLamports', getU64Codec()],
]);

// Account roles for @solana/kit instructions
const ROLE_READONLY = 0;
const ROLE_WRITABLE = 1;
const ROLE_SIGNER_WRITABLE = 3;

export class EscrowDevnetClient implements EscrowClient {
  private readonly programId: Address;
  private readonly rpc: any;

  constructor(config: { rpcUrl: string; programId: string }) {
    this.programId = address(config.programId);
    this.rpc = createSolanaRpc(config.rpcUrl);
  }

  private async getMintDecimals(mint: Address): Promise<number> {
    try {
      const response = await this.rpc.getTokenSupply(mint).send();
      return response.value.decimals;
    } catch (e) {
      console.warn(`Could not fetch decimals for ${mint}, defaulting to 9`, e);
      return 9;
    }
  }

  public async makeOffer(payload: MakeOfferPayload): Promise<EscrowActionResult> {
    try {
      const connector = walletStandardService.getConnectedConnector();
      if (!connector) {
        return this.errorActionResult('WALLET_NOT_CONNECTED', 'Wallet is not connected');
      }

      const maker = address(connector.address);
      const tokenMintA = address(payload.tokenAMintAddress);
      const tokenMintB = address(payload.tokenBMintAddress);
      
      const id = BigInt(Math.floor(Date.now() / 1000));
      
      // Fetch actual decimals from blockchain instead of assuming 9
      const [decimalsA, decimalsB] = await Promise.all([
        this.getMintDecimals(tokenMintA),
        this.getMintDecimals(tokenMintB)
      ]);

      const tokenAAmount = BigInt(Math.floor(Number(payload.tokenAAmountUi) * 10 ** decimalsA)); 
      const tokenBAmount = BigInt(Math.floor(Number(payload.tokenBRequiredAmountUi) * 10 ** decimalsB));

      const offerAddress = await deriveOfferAddress(this.programId, maker, id);
      const vault = await getAssociatedTokenAddress(tokenMintA, offerAddress);
      const makerAtaA = await getAssociatedTokenAddress(tokenMintA, maker);


      const instructionData = makeOfferInstructionCodec.encode({
        discriminator: getAnchorDiscriminator('make_offer', 'instruction'),
        id,
        token_a_offered_amount: tokenAAmount,
        token_b_wanted_amount: tokenBAmount,
      });


      const instruction = {
        programAddress: this.programId,
        accounts: [
          { address: maker, role: ROLE_SIGNER_WRITABLE as any },
          { address: tokenMintA, role: ROLE_READONLY as any },
          { address: tokenMintB, role: ROLE_READONLY as any },
          { address: makerAtaA, role: ROLE_WRITABLE as any },
          { address: offerAddress, role: ROLE_WRITABLE as any },
          { address: vault, role: ROLE_WRITABLE as any },
          { address: ASSOCIATED_TOKEN_PROGRAM_ID, role: ROLE_READONLY as any },
          { address: TOKEN_PROGRAM_ID, role: ROLE_READONLY as any },
          { address: address('11111111111111111111111111111111'), role: ROLE_READONLY as any },
        ],
        data: instructionData,
      };

      const cuLimitInstruction = {
        programAddress: address('ComputeBudget111111111111111111111111111111'),
        accounts: [],
        data: setComputeUnitLimitCodec.encode({ instruction: 2, units: 300000 }),
      };

      const cuPriceInstruction = {
        programAddress: address('ComputeBudget111111111111111111111111111111'),
        accounts: [],
        data: setComputeUnitPriceCodec.encode({ instruction: 3, microLamports: 100000n }),
      };

      const { value: blockhash } = await this.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
      const message = pipe(
        createTransactionMessage({ version: 'legacy' }),
        (m) => setTransactionMessageFeePayer(maker, m),
        (m) => setTransactionMessageLifetimeUsingBlockhash(blockhash, m),
        (m) => appendTransactionMessageInstruction(cuLimitInstruction as any, m),
        (m) => appendTransactionMessageInstruction(cuPriceInstruction as any, m),
        (m) => appendTransactionMessageInstruction(instruction as any, m)
      );

      // Compile and serialize transaction for Wallet Standard
      const transaction = compileTransaction(message);
      const wireTransaction = getBase64EncodedWireTransaction(transaction);
      const serializedTransaction = decodeBase64(wireTransaction);
      

      const signature = await walletStandardService.signAndSendTransaction(serializedTransaction);
      
      return {
        success: true,
        errorCode: null,
        errorMessage: null,
        transaction: {
          signature,
          explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
        }
      };
    } catch (e: any) {
      console.error("Make offer error:", e);
      return this.errorActionResult('UNKNOWN', e.message);
    }
  }

  public async takeOffer(payload: TakeOfferPayload): Promise<EscrowActionResult> {
    try {
      const connector = walletStandardService.getConnectedConnector();
      if (!connector) {
        return this.errorActionResult('WALLET_NOT_CONNECTED', 'Wallet is not connected');
      }

      const taker = address(connector.address);
      const offerAddress = address(payload.offerAddress);
      
      const offerAccountInfo = await this.rpc.getAccountInfo(offerAddress, { encoding: 'base64' }).send();
      if (!offerAccountInfo.value) throw new Error("Offer account not found");
      
      const offerData = offerAccountCodec.decode(decodeBase64(offerAccountInfo.value.data[0] as string) as any) as any;

      const maker = offerData.maker;
      const tokenMintA = offerData.token_mint_a;
      const tokenMintB = offerData.token_mint_b;


      const vault = await getAssociatedTokenAddress(tokenMintA, offerAddress);
      const takerAtaA = await getAssociatedTokenAddress(tokenMintA, taker);
      const takerAtaB = await getAssociatedTokenAddress(tokenMintB, taker);
      const makerAtaB = await getAssociatedTokenAddress(tokenMintB, maker);

      const instructionData = takeOfferInstructionCodec.encode({
        discriminator: getAnchorDiscriminator('take_offer', 'instruction'),
      });

      const instruction = {
        programAddress: this.programId,
        accounts: [
          { address: taker, role: ROLE_SIGNER_WRITABLE as any },
          { address: maker, role: ROLE_WRITABLE as any },
          { address: tokenMintA, role: ROLE_READONLY as any },
          { address: tokenMintB, role: ROLE_READONLY as any },
          { address: takerAtaA, role: ROLE_WRITABLE as any },
          { address: takerAtaB, role: ROLE_WRITABLE as any },
          { address: makerAtaB, role: ROLE_WRITABLE as any },
          { address: offerAddress, role: ROLE_WRITABLE as any },
          { address: vault, role: ROLE_WRITABLE as any },
          { address: ASSOCIATED_TOKEN_PROGRAM_ID, role: ROLE_READONLY as any },
          { address: TOKEN_PROGRAM_ID, role: ROLE_READONLY as any },
          { address: address('11111111111111111111111111111111'), role: ROLE_READONLY as any },
        ],
        data: instructionData,
      };

      const cuLimitInstruction = {
        programAddress: address('ComputeBudget111111111111111111111111111111'),
        accounts: [],
        data: setComputeUnitLimitCodec.encode({ instruction: 2, units: 400000 }),
      };

      const cuPriceInstruction = {
        programAddress: address('ComputeBudget111111111111111111111111111111'),
        accounts: [],
        data: setComputeUnitPriceCodec.encode({ instruction: 3, microLamports: 100000n }),
      };

      const { value: blockhash } = await this.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
      const message = pipe(
        createTransactionMessage({ version: 0 }),
        (m) => setTransactionMessageFeePayer(taker, m),
        (m) => setTransactionMessageLifetimeUsingBlockhash(blockhash, m),
        (m) => appendTransactionMessageInstruction(cuLimitInstruction as any, m),
        (m) => appendTransactionMessageInstruction(cuPriceInstruction as any, m),
        (m) => appendTransactionMessageInstruction(instruction as any, m)
      );

      // Compile and serialize transaction for Wallet Standard
      const transaction = compileTransaction(message);
      const wireTransaction = getBase64EncodedWireTransaction(transaction);
      const serializedTransaction = decodeBase64(wireTransaction);

      const signature = await walletStandardService.signAndSendTransaction(serializedTransaction);

      return {
        success: true,
        errorCode: null,
        errorMessage: null,
        transaction: {
          signature,
          explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
        }
      };
    } catch (e: any) {
      console.error("Take offer error:", e);
      return this.errorActionResult('UNKNOWN', e.message);
    }
  }

  public async fetchOffers(): Promise<OfferListResult> {
    try {
      const discriminator = getAnchorDiscriminator('Offer', 'account');
      const base58Discriminator = walletStandardService.toBase58(discriminator); 

      const response = await this.rpc.getProgramAccounts(this.programId, { 
        encoding: 'base64',
        filters: [
          {
            memcmp: {
              offset: 0n,
              bytes: base58Discriminator as any,
              encoding: 'base58' as any
            }
          }
        ]
      }).send();
      
      const rawOffers = (response as any[] || [])
        .map((acc: any): { offer: any, address: string } | null => {
          try {
            const data = offerAccountCodec.decode(decodeBase64(acc.account.data[0] as string) as any) as any;
            return { offer: data, address: acc.pubkey as string };
          } catch (e) {
            return null;
          }
        })
        .filter((o): o is { offer: any, address: string } => o !== null);

      if (rawOffers.length === 0) return { offers: [], errorCode: null, errorMessage: null };

      // Derive vault addresses
      const vaultAddresses = await Promise.all(
        rawOffers.map(o => getAssociatedTokenAddress(address(o.offer.token_mint_a), address(o.address)))
      );

      const vaultInfos = await this.rpc.getMultipleAccounts(vaultAddresses, { encoding: 'base64' }).send();

      // Collect all unique mints to fetch decimals once
      const uniqueMints = Array.from(new Set([
        ...rawOffers.map(o => o.offer.token_mint_a as string),
        ...rawOffers.map(o => o.offer.token_mint_b as string)
      ]));

      const decimalsMap = new Map<string, number>();
      await Promise.all(uniqueMints.map(async (mint) => {
        const d = await this.getMintDecimals(address(mint));
        decimalsMap.set(mint, d);
      }));
      
      const offers: OfferViewModel[] = rawOffers.map((o, index) => {
        const vaultInfo = vaultInfos.value[index];
        let offeredAmountRaw = 0n;
        if (vaultInfo) {
          try {
            const data = decodeBase64(vaultInfo.data[0] as string);
            const decoded = splTokenAccountCodec.decode(data as any) as any;
            offeredAmountRaw = decoded.amount;
          } catch (e) {
             console.error("Failed to decode token account for vault", e);
          }
        }

        const decA = decimalsMap.get(o.offer.token_mint_a) || 9;
        const decB = decimalsMap.get(o.offer.token_mint_b) || 9;

        return {
          offerAddress: o.address,
          makerAddress: o.offer.maker as string,
          tokenAMintAddress: o.offer.token_mint_a as string,
          tokenBMintAddress: o.offer.token_mint_b as string,
          offeredAmount: (Number(offeredAmountRaw) / 10**decA).toString(),
          requiredAmount: (Number(o.offer.token_b_wanted_amount) / 10**decB).toString(), 
          createdAtSlot: null as number | null
        };
      });

      return { offers, errorCode: null, errorMessage: null };
    } catch (e: any) {
      console.error("Fetch offers error:", e);
      return { offers: [], errorCode: 'NETWORK_ERROR', errorMessage: e.message };
    }
  }

  private errorActionResult(code: EscrowClientErrorCode, message: string): EscrowActionResult {
    return { success: false, errorCode: code, errorMessage: message, transaction: null };
  }
}


export function createEscrowClient(config: { rpcUrl: string; programId: string }): EscrowClient {
  return new EscrowDevnetClient(config);
}
