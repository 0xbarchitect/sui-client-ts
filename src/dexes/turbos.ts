import { Network, TurbosSdk, Pool } from 'turbos-clmm-sdk';
import { DexExecutor } from './interface';
import { Ed25519Keypair } from '@mysten/sui/dist/cjs/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import Decimal from 'decimal.js';

export class Turbos implements DexExecutor {
  private sdk: TurbosSdk;
  private sender: Ed25519Keypair;
  private suiClient: SuiClient;

  constructor(network: 'mainnet' | 'testnet', sender: Ed25519Keypair) {
    this.sdk = new TurbosSdk(network as Network);
    this.sender = sender;
    this.suiClient = new SuiClient({ url: getFullnodeUrl(network) });
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
    // Implement the swap logic using the Turbos SDK
    console.log('Turbos Swap function called with parameters:', {
      pool_id,
      amount_a,
      amount_b,
      decimals_a,
      decimals_b,
      a2b,
      by_amount_in,
    });

    const contract = await this.sdk.contract.getConfig();
    console.log('Contract', contract);

    const pool = await this.sdk.pool.getPool(pool_id);
    console.log('Pool details:', pool);

    const coin_type_a = pool.types[0];
    const coin_type_b = pool.types[1];

    const computeSwapResult = await this.sdk.trade.computeSwapResultV2({
      pools: [
        {
          pool: pool_id,
          a2b,
          amountSpecified: a2b ? amount_a : amount_b,
        },
      ],
      address: this.sender.getPublicKey().toSuiAddress(),
      amountSpecifiedIsInput: by_amount_in,
    });

    console.log('Computed swap result:', computeSwapResult);

    const nextTickIndex = this.sdk.math.bitsToNumber(computeSwapResult[0].tick_current_index.bits);
    console.log('Next tick index:', nextTickIndex);

    console.log('build tx payload');
    const options = {
      routes: [
        {
          pool: pool_id,
          a2b,
          nextTickIndex,
        },
      ],
      coinTypeA: a2b ? coin_type_a : coin_type_b,
      coinTypeB: a2b ? coin_type_b : coin_type_a,
      address: this.sender.getPublicKey().toSuiAddress(),
      amountA: a2b ? computeSwapResult[0].amount_a : computeSwapResult[0].amount_b,
      amountB: a2b ? computeSwapResult[0].amount_b : computeSwapResult[0].amount_a,
      amountSpecifiedIsInput: by_amount_in,
      slippage: '10', // percentage
    };

    const swapPayload = await this.sdk.trade.swap(options);
    console.log('Transaction payload:', swapPayload);

    console.log('sending transaction...');
    const tx = await this.suiClient.signAndExecuteTransaction({
      signer: this.sender,
      transaction: swapPayload,
      options: {
        showBalanceChanges: true,
        showEffects: true,
        showInput: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });
    console.log('Transaction result:', tx);
  }

  async add_liquidity(
    pool_id: string,
    amount_a: number,
    amount_b: number,
    decimals_a: number,
    decimals_b: number,
    fix_amount_a: boolean
  ): Promise<void> {
    // Implement the add liquidity logic using the Turbos SDK
  }
  async remove_liquidity(pool_id: string, position_id: string): Promise<void> {
    // Implement the remove liquidity logic using the Turbos SDK
  }
  async create_pool(
    coin_type_a: string,
    coin_type_b: string,
    decimals_a: number,
    decimals_b: number,
    amount_a: number,
    amount_b: number,
    fix_amount_a: boolean
  ): Promise<void> {
    // Implement the create pool logic using the Turbos SDK
  }

  getFunctionNameAndTypeArguments(pools: Pool.Types[], coinTypeA: string, coinTypeB: string) {
    let typeArguments: string[] = [];
    const functionName: string[] = ['swap'];
    if (pools.length === 1) {
      typeArguments = pools[0]!;
      if (coinTypeA === typeArguments[0]) {
        functionName.push('a', 'b');
      } else {
        functionName.push('b', 'a');
      }
    } else {
      const pool1Args = pools[0]!;
      const pool2Args = pools[1]!;
      if (coinTypeA === pool1Args[0]) {
        functionName.push('a', 'b');
        typeArguments.push(pool1Args[0], pool1Args[2], pool1Args[1]);
      } else {
        functionName.push('b', 'a');
        typeArguments.push(pool1Args[1], pool1Args[2], pool1Args[0]);
      }

      typeArguments.push(pool2Args[2], coinTypeB);
      if (coinTypeB === pool2Args[0]) {
        functionName.push('c', 'b');
      } else {
        functionName.push('b', 'c');
      }
    }

    return {
      functionName: functionName.join('_'),
      typeArguments,
    };
  }
}
