import { NAVISDKClient, CoinInfo } from 'navi-sdk';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { LendingExecutor } from './interface';
import {
  Sui,
  USDT,
  WETH,
  vSui,
  haSui,
  CETUS,
  NAVX,
  WBTC,
  AUSD,
  wUSDC,
  nUSDC,
  ETH,
  USDY,
  NS,
  LorenzoBTC,
  DEEP,
  FDUSD,
  BLUE,
  BUCK,
  suiUSDT,
} from 'navi-sdk';
import { BigNumber } from '@firefly-exchange/library-sui';

export class Navi implements LendingExecutor {
  private sdk: NAVISDKClient;
  private sender: Ed25519Keypair;
  private suiClient: SuiClient;

  constructor(network: 'mainnet' | 'testnet', sender: Ed25519Keypair) {
    this.sdk = new NAVISDKClient({
      mnemonic: '',
      networkType: network,
      numberOfAccounts: 1,
      privateKeyList: [sender.getSecretKey()],
    });
    //const account = this.sdk.accounts[0];
    //console.log('Account:', account);

    this.sender = sender;
    this.suiClient = new SuiClient({ url: getFullnodeUrl(network) });
  }

  async deposit(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Navi Deposit function called with parameters:', {
      coin_type,
      amount,
    });

    const coin_info: CoinInfo = { symbol: 'SUI', address: coin_type, decimal: decimals };
    amount = new BigNumber(amount).toNumber();

    console.log('amount', amount);

    const tx = await this.sdk.accounts[0].depositToNavi(Sui, amount);
    console.log('tx', tx);
  }

  async withdraw(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Navi Withdraw function called with parameters:', {
      coin_type,
      amount,
    });

    const coin_info: CoinInfo = { symbol: 'SUI', address: coin_type, decimal: decimals };
    amount = new BigNumber(amount).toNumber();
    console.log('amount', amount);

    const tx = await this.sdk.accounts[0].withdraw(Sui, amount);
    console.log('tx', tx);
  }
}
