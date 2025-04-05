import {
  initCetusSDK,
  TickMath,
  ClmmPoolUtil,
  AddLiquidityFixTokenParams,
  Percentage,
  adjustForCoinSlippage,
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

  async remove_liquidity(pool_id: string, position_id: string): Promise<void> {
    // Implement the logic to remove liquidity here
    console.log('Removing liquidity');

    const pool = await this.client.Pool.getPool(pool_id);
    console.log('pool', pool);

    const position = await this.client.Position.getPositionById(position_id);

    console.log('position', position);

    const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(position.tick_lower_index);
    const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(position.tick_upper_index);

    console.log('lowerSqrtPrice', lowerSqrtPrice, 'upperSqrtPrice', upperSqrtPrice);

    const ticksHandle = pool.ticks_handle;

    const tickLower = await this.client.Pool.getTickDataByIndex(
      ticksHandle,
      position.tick_lower_index
    );
    const tickUpper = await this.client.Pool.getTickDataByIndex(
      ticksHandle,
      position.tick_upper_index
    );

    console.log('tickLower', tickLower, 'tickUpper', tickUpper);

    const liquidity = new BN(position.liquidity);
    const slippage = new Percentage(new BN(5), new BN(100));

    const curSqrtPrice = new BN(pool.current_sqrt_price);
    const coinAmounts = ClmmPoolUtil.getCoinAmountFromLiquidity(
      liquidity,
      curSqrtPrice,
      lowerSqrtPrice,
      upperSqrtPrice,
      false
    );

    console.log('coinAmounts', coinAmounts);

    const { tokenMaxA, tokenMaxB } = adjustForCoinSlippage(coinAmounts, slippage, false);
    console.log('tokenMaxA', tokenMaxA, 'tokenMaxB', tokenMaxB);

    // get all rewarders of position
    const rewards: any[] = [];

    console.log('rewards', rewards);

    const rewardCoinTypes = rewards
      .filter((item) => Number(item.amount_owed) > 0)
      .map((item) => item.coin_address);

    // build close position payload
    const closePositionTransactionPayload =
      await this.client.Position.closePositionTransactionPayload({
        coinTypeA: pool.coinTypeA,
        coinTypeB: pool.coinTypeB,
        min_amount_a: tokenMaxA.toString(),
        min_amount_b: tokenMaxB.toString(),
        rewarder_coin_types: [...rewardCoinTypes],
        pool_id: pool.poolAddress,
        pos_id: position_id,
      });

    console.log('closePositionTransactionPayload', closePositionTransactionPayload);

    const tx = await this.client.fullClient.sendTransaction(
      this.sender,
      closePositionTransactionPayload
    );

    console.log('Transaction response:', tx);
  }
}
