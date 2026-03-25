import { address, createTransactionMessage, setTransactionMessageFeePayer, setTransactionMessageLifetimeUsingBlockhash, appendTransactionMessageInstruction, pipe, compileTransaction, getBase64EncodedWireTransaction, createSolanaRpc } from '@solana/kit';
import { getStructCodec, getBytesCodec, getU64Codec, fixCodecSize } from '@solana/kit';

const rpc = createSolanaRpc('https://api.devnet.solana.com');

async function run() {
  const maker = address('6K5GMtE7aF5ruTD56jsSJcmxvJ5dVXsK96zzZNW4aqCP');
  const tokenMintA = address('57vsKsWdn9eu8dKFBgszfioGMnD22sgTJ2xMirMWsxfa');
  const tokenMintB = address('BDyr1JmucGmiNRhHhKuXjxyo26axsWnikqBU1tLcJUiM');
  const { value: blockhash } = await rpc.getLatestBlockhash().send();
  
  const instruction = {
    programAddress: address('4g5EN9Sk7wEcZqfjdjDtvq7T9u5YUrBKTe23fVJoL8yy'),
    accounts: [
      { address: maker, role: 3 as any },
    ],
    data: new Uint8Array([214, 98, 97, 35, 59, 12, 44, 178]),
  };

  const message = pipe(
    createTransactionMessage({ version: 'legacy' }),
    (m) => setTransactionMessageFeePayer(maker, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(blockhash, m),
    (m) => appendTransactionMessageInstruction(instruction as any, m)
  );
  const transaction = compileTransaction(message);
  const wireTransaction = getBase64EncodedWireTransaction(transaction);
  console.log("Wire Tx:", wireTransaction);
}
run().catch(console.error);
