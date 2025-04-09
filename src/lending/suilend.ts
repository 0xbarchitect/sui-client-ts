import { SuilendClient, LENDING_MARKET_ID, LENDING_MARKET_TYPE } from '@suilend/sdk';
import { Ed25519Keypair } from '@mysten/sui//keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { LendingExecutor } from './interface';
import { BigNumber } from '@firefly-exchange/library-sui';

export class Suilend implements LendingExecutor {
  private client?: SuilendClient;
  private sender: Ed25519Keypair;
  private suiClient: SuiClient;

  constructor(network: 'mainnet' | 'testnet', sender: Ed25519Keypair) {
    this.sender = sender;
    this.suiClient = new SuiClient({ url: getFullnodeUrl(network) });
  }

  async init(): Promise<void> {
    console.log('Suilend SDK initialized');
    this.client = await SuilendClient.initialize(
      LENDING_MARKET_ID,
      LENDING_MARKET_TYPE,
      this.suiClient
    );

    console.log('Suilend client initialized:', this.client);
  }

  async deposit(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Suilend Deposit function called with parameters:', {
      coin_type,
      amount,
    });
  }

  async withdraw(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Suilend Withdraw function called with parameters:', {
      coin_type,
      amount,
    });
  }

  async borrow(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Suilend Borrow function called with parameters:', {
      coin_type,
      amount,
    });
  }

  async repay(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Suilend Repay function called with parameters:', {
      coin_type,
      amount,
    });
  }
}
