import { getWallets } from '@wallet-standard/app'
import type { Wallet } from '@wallet-standard/base'
import { StandardConnect, StandardDisconnect } from '@wallet-standard/features'
import {
  SolanaSignAndSendTransaction,
  SolanaSignTransaction,
} from '@solana/wallet-standard-features';
import { createSolanaRpc } from '@solana/kit';
import type { WalletAccountView, WalletConnectorView } from '../types/escrow'
import { SOLANA_CHAIN_DEVNET } from '../constants/app'
import { toShortAddress } from '../lib/address'
import { encodeBase58, encodeBase64 } from '../utils/anchor'
import { DEVNET_RPC_URL } from '../utils/solanaKit'


const EMPTY_CONNECTORS: WalletConnectorView[] = []
const STORAGE_KEY = 'escrowly_last_wallet_id'


type WalletChangeHandler = (connectors: WalletConnectorView[]) => void

export class WalletStandardService {
  private readonly registry = getWallets()

  private connectedWallet: Wallet | null = null

  private connectedAccountAddress: string | null = null

  private readonly subscriptions = new Set<WalletChangeHandler>()

  private rpc = createSolanaRpc(DEVNET_RPC_URL)

  constructor() {
    this.registry.on('register', (wallet) => {
      this.emitWalletChanges()
      this.tryAutoConnect(wallet)
    })

    this.registry.on('unregister', () => {
      this.emitWalletChanges()
    })

    // Check already registered wallets
    for (const wallet of this.registry.get()) {
      this.tryAutoConnect(wallet)
    }
  }


  private async tryAutoConnect(wallet: Wallet) {
    const savedId = localStorage.getItem(STORAGE_KEY)
    if (savedId && this.getWalletId(wallet) === savedId && !this.connectedWallet) {
      try {
        await this.connect(savedId)
      } catch (e) {
        console.error('Auto-connect failed', e)
      }
    }
  }


  public subscribe(handler: WalletChangeHandler): () => void {
    this.subscriptions.add(handler)
    handler(this.getConnectors())

    return () => {
      this.subscriptions.delete(handler)
    }
  }

  public getConnectors(): WalletConnectorView[] {
    const wallets = this.registry.get()

    if (wallets.length === 0) {
      return EMPTY_CONNECTORS
    }

    // De-duplicate by name to avoid multiple versions of the same wallet appearing
    const uniqueWallets = new Map<string, Wallet>()
    for (const wallet of wallets) {
      // Exclude MetaMask due to severe Solana Snap bugs parsing raw v0/legacy transactions
      if (wallet.name.toLowerCase().includes('metamask')) continue;

      if (!uniqueWallets.has(wallet.name)) {
        uniqueWallets.set(wallet.name, wallet)
      }
    }

    return Array.from(uniqueWallets.values())
      .map((wallet) => this.mapWalletToConnector(wallet))
      .filter((connector) => connector.supportsSolana)
  }

  public getCurrentAccount(): WalletAccountView | null {
    if (this.connectedWallet === null || this.connectedAccountAddress === null) {
      return null
    }

    return {
      address: this.connectedAccountAddress,
      shortAddress: toShortAddress(this.connectedAccountAddress),
      walletName: this.connectedWallet.name,
    }
  }

  public async connect(connectorId: string): Promise<WalletAccountView> {
    const wallet = this.findWalletById(connectorId)

    if (wallet === null) {
      throw new Error('Selected wallet connector is not available')
    }

    const connectFeature = wallet.features[StandardConnect] as any

    if (!connectFeature) {
      throw new Error('Wallet does not support standard connect feature')
    }

    await connectFeature.connect()

    const connectedAccount = wallet.accounts.at(0)

    if (!connectedAccount) {
      throw new Error('Wallet returned no connected account')
    }

    this.connectedWallet = wallet
    this.connectedAccountAddress = connectedAccount.address
    localStorage.setItem(STORAGE_KEY, connectorId)

    this.emitWalletChanges()

    return {
      address: connectedAccount.address,
      shortAddress: toShortAddress(connectedAccount.address),
      walletName: wallet.name,
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connectedWallet === null) {
      return
    }

    const disconnectFeature = this.connectedWallet.features[StandardDisconnect] as any

    if (disconnectFeature) {
      await disconnectFeature.disconnect()
    }

    this.connectedWallet = null
    this.connectedAccountAddress = null
    localStorage.removeItem(STORAGE_KEY)

    this.emitWalletChanges()
  }

  public setRpcUrl(url: string): void {
    this.rpc = createSolanaRpc(url)
  }


  public isWalletConnected(): boolean {
    return this.connectedWallet !== null && this.connectedAccountAddress !== null
  }

  public canSignAndSendTransactions(): boolean {
    if (this.connectedWallet === null) {
      return false
    }

    return Boolean(this.connectedWallet.features[SolanaSignAndSendTransaction])
  }

  public getConnectedConnector(): { address: string; name: string } | null {
    if (!this.connectedWallet || !this.connectedAccountAddress) return null;
    return {
      address: this.connectedAccountAddress,
      name: this.connectedWallet.name
    };
  }

  public async signAndSendTransaction(message: any): Promise<string> {
    if (!this.connectedWallet) throw new Error("No wallet connected");
    
    const targetAccount = this.connectedWallet.accounts.find(
      a => a.address === this.connectedAccountAddress
    );
    
    if (!targetAccount) {
      throw new Error("Connected account not found in wallet");
    }

    // Try signTransaction + sendRawTransaction first as it's more stable in many wallets
    const signFeature = this.connectedWallet.features[SolanaSignTransaction];
    if (signFeature) {
        try {
            const [result] = await (signFeature as any).signTransaction({
                account: targetAccount,
                chain: SOLANA_CHAIN_DEVNET,
                transaction: message,
            });
            
            const signedTransaction = result.signedTransaction;
            // Send via RPC directly
            const response = await this.rpc.sendTransaction(encodeBase64(signedTransaction) as any, { encoding: 'base64' }).send();
            return response;
        } catch (e) {
            console.warn("signTransaction failed, falling back to signAndSendTransaction:", e);
        }
    }

    const feature = this.connectedWallet.features[SolanaSignAndSendTransaction];
    if (!feature) throw new Error("Wallet does not support signAndSendTransaction");

    const [result] = await (feature as any).signAndSendTransaction({
      account: targetAccount,
      chain: SOLANA_CHAIN_DEVNET,
      transaction: message,
    });

    return result.signature;
  }


  public getChain(): string {
    return SOLANA_CHAIN_DEVNET
  }

  public toBase58(bytes: Uint8Array): string {
    return encodeBase58(bytes as any);
  }


  private emitWalletChanges(): void {

    const connectors = this.getConnectors()

    this.subscriptions.forEach((handler) => {
      handler(connectors)
    })
  }

  private findWalletById(connectorId: string): Wallet | null {
    const wallets = this.registry.get()

    for (const wallet of wallets) {
      if (this.getWalletId(wallet) === connectorId) {
        return wallet
      }
    }

    return null
  }

  private mapWalletToConnector(wallet: Wallet): WalletConnectorView {
    return {
      id: this.getWalletId(wallet),
      name: wallet.name,
      icon: wallet.icon ?? null,
      isInstalled: true,
      supportsSolana: Boolean(wallet.features[SolanaSignAndSendTransaction]),
    }
  }

  private getWalletId(wallet: Wallet): string {
    return `${wallet.name.toLowerCase()}-${wallet.version}`
  }
}

export const walletStandardService = new WalletStandardService()
