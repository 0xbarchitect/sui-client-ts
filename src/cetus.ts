import {
  initCetusSDK,
  TickMath,
  ClmmPoolUtil,
  AddLiquidityFixTokenParams,
} from '@cetusprotocol/cetus-sui-clmm-sdk';
import { BN } from 'bn.js';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export class Cetus {
  private client: any;
  private sender: Ed25519Keypair;

  constructor(network: 'mainnet' | 'testnet', sender: Ed25519Keypair) {
    console.log('Cetus initialized');
    const senderAddress = sender.getPublicKey().toSuiAddress();
    this.client = initCetusSDK({ network: network, wallet: senderAddress });
    this.sender = sender;
  }

  async add_liquidity(
    poolId: string,
    amount_a: number,
    amount_b: number,
    fixed_amount_a: boolean,
    decimals_a: number,
    decimals_b: number
  ): Promise<void> {
    console.log(`Adding liquidity to pool ${poolId} with amounts ${amount_a} and ${amount_b}`);
    // Implement the logic to add liquidity here
    const pool = await this.client.Pool.getPool(poolId);
    console.log('pool', pool);

    const lowerTick = TickMath.getInitializableTickIndex(
      new BN(pool.current_tick_index).toNumber(),
      new BN(pool.tickSpacing).toNumber()
    );
    const upperTick = TickMath.getNextInitializableTickIndex(
      new BN(pool.current_tick_index).toNumber(),
      new BN(pool.tickSpacing).toNumber()
    );

    console.log(`Lower tick: ${lowerTick}, Upper tick: ${upperTick}`);

    const curSqrtPrice = new BN(pool.current_sqrt_price);

    const coinAmount = new BN(fixed_amount_a ? amount_a : amount_b);
    const iscoinA = fixed_amount_a;
    const slippage = 0.01;

    const liquidityInput = ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(
      lowerTick,
      upperTick,
      coinAmount,
      iscoinA,
      true,
      slippage,
      curSqrtPrice
    );

    console.log('Liquidity input:', liquidityInput);

    const input_amount_a = fixed_amount_a
      ? coinAmount.toNumber()
      : liquidityInput.tokenMaxA.toNumber();
    const input_amount_b = fixed_amount_a
      ? liquidityInput.tokenMaxB.toNumber()
      : coinAmount.toNumber();

    console.log(`Input amount A: ${input_amount_a}, Input amount B: ${input_amount_b}`);

    const addLiquidityParams: AddLiquidityFixTokenParams = {
      coinTypeA: pool.coinTypeA,
      coinTypeB: pool.coinTypeB,
      pool_id: pool.poolAddress,
      tick_lower: lowerTick.toString(),
      tick_upper: upperTick.toString(),
      fix_amount_a: fixed_amount_a,
      amount_a: input_amount_a,
      amount_b: input_amount_b,
      slippage,
      is_open: true,
      rewarder_coin_types: [],
      collect_fee: false,
      pos_id: '',
    };

    const createAddLiquidityTxPayload =
      await this.client.Position.createAddLiquidityFixTokenPayload(addLiquidityParams, {
        slippage,
        curSqrtPrice,
      });

    console.log('Transaction payload:', createAddLiquidityTxPayload);

    const tx = await this.client.fullClient.sendTransaction(
      this.sender,
      createAddLiquidityTxPayload
    );

    console.log('Transaction response:', tx);
  }
}
