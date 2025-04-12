import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export class Query {
  private suiClient: SuiClient;

  constructor(network: 'mainnet' | 'testnet') {
    this.suiClient = new SuiClient({ url: getFullnodeUrl(network) });
  }

  async getTxEvents(digest: string): Promise<void> {}
}
