import { OnChainCalls, QueryChain, ISwapParams } from '@firefly-exchange/library-sui/dist/src/spot';
import { toBigNumber, SuiClient, BigNumber } from '@firefly-exchange/library-sui';
import { mainnet } from './bluefin_config';
import { getFullnodeUrl } from '@mysten/sui/client';
import { DexExecutor } from './interface';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export class Bluefin implements DexExecutor {
  private sender: Ed25519Keypair;
  private suiClient: SuiClient;
  private onchainCalls: OnChainCalls;
  private queryChain: QueryChain;

  constructor(network: 'mainnet' | 'testnet', sender: Ed25519Keypair) {
    this.sender = sender;
    this.suiClient = new SuiClient({ url: getFullnodeUrl(network) });

    this.onchainCalls = new OnChainCalls(this.suiClient, mainnet, { signer: this.sender });
    this.queryChain = new QueryChain(this.suiClient);
  }

  async swap(
    pool_id: string,
    amount_a: number,
    amount_b: number,
    decimals_a: number,
    decimals_b: number,
    a2b: boolean,
    by_amount_in: boolean
  ): Promise<void> {
    console.log('Bluefin Swap function called with parameters:', {
      pool_id,
      amount_a,
      amount_b,
      decimals_a,
      decimals_b,
      a2b,
      by_amount_in,
    });

    let pool = await this.queryChain.getPool(pool_id);
    console.log('Pool details:', pool);

    let iSwapParams: ISwapParams = {
      pool,
      amountIn: by_amount_in == true ? new BigNumber(a2b ? amount_a : amount_b) : 0,
      amountOut: by_amount_in == true ? 0 : new BigNumber(a2b ? amount_b : amount_a),
      aToB: a2b,
      byAmountIn: by_amount_in,
      slippage: 0.05,
    };
    console.log('Swap parameters:', iSwapParams);

    console.log('sending transaction...');
    let resp = await this.onchainCalls.swapAssets(iSwapParams);
    console.log('Swap response:', resp);
  }

  async add_liquidity(
    pool_id: string,
    amount_a: number,
    amount_b: number,
    decimals_a: number,
    decimals_b: number,
    fix_amount_a: boolean
  ): Promise<void> {}

  async remove_liquidity(pool_id: string, position_id: string): Promise<void> {}

  async create_pool(
    coin_type_a: string,
    coin_type_b: string,
    decimals_a: number,
    decimals_b: number,
    amount_a: number,
    amount_b: number,
    fix_amount_a: boolean
  ): Promise<void> {}
}
