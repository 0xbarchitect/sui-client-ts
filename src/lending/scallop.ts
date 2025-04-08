import { Scallop, ScallopClient, ScallopQuery } from '@scallop-io/sui-scallop-sdk';
import { LendingExecutor } from './interface';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { BigNumber } from '@firefly-exchange/library-sui';

export class ScallopExecutor implements LendingExecutor {
  private sdk: Scallop;
  private sender: Ed25519Keypair;
  private suiClient: SuiClient;

  private client?: ScallopClient;
  private query?: ScallopQuery;

  constructor(network: 'mainnet' | 'testnet', sender: Ed25519Keypair) {
    this.sender = sender;
    this.suiClient = new SuiClient({ url: getFullnodeUrl(network) });

    this.sdk = new Scallop({
      secretKey: sender.getSecretKey(),
      networkType: network,
      addressId: '67c44a103fe1b8c454eb9699',
    });
  }

  async init(): Promise<void> {
    console.log('Scallop SDK initialized');

    this.client = await this.sdk.createScallopClient();
    console.info('Scallop Your wallet:', this.client.walletAddress);

    this.query = await this.sdk.createScallopQuery();
  }

  async deposit(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Navi Deposit function called with parameters:', {
      coin_type,
      amount,
    });
    amount = new BigNumber(amount).toNumber();

    const obligations = await this.client!.getObligations();
    console.log('Obligations:', obligations);

    console.log('depositing...');
    const depositResult = await this.client!.deposit(coin_type, amount);
    console.log('Deposit result:', depositResult);
  }

  async withdraw(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Navi Withdraw function called with parameters:', {
      coin_type,
      amount,
    });
    amount = new BigNumber(amount).toNumber();

    const obligations = await this.query!.getObligations();
    console.log('Obligations:', obligations);

    const obligationData = await this.query!.queryObligation(obligations[0].id);
    console.log('Obligation data:', obligationData);

    //console.log('withdrawing...');
    //const withdrawResult = await this.client!.withdraw(coin_type, amount);
    //console.log('Withdraw result:', withdrawResult);
  }

  async borrow(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Navi Borrow function called with parameters:', {
      coin_type,
      amount,
    });
    amount = new BigNumber(amount).toNumber();

    const obligations = await this.client!.getObligations();
    console.log('Obligations:', obligations);

    console.log('borrowing...');
    const borrowResult = await this.client!.borrow(
      coin_type,
      amount,
      true,
      obligations[0].id,
      obligations[0].keyId
    );
    console.log('Borrow result:', borrowResult);
  }

  async repay(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Navi Repay function called with parameters:', {
      coin_type,
      amount,
    });
  }
}
