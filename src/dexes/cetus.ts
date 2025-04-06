import CetusClmmSDK, {
  initCetusSDK,
  TickMath,
  ClmmPoolUtil,
  AddLiquidityFixTokenParams,
  Percentage,
  adjustForCoinSlippage,
  d,
} from '@cetusprotocol/cetus-sui-clmm-sdk';
import { BN } from 'bn.js';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { DexExecutor } from './interface';

export class Cetus implements DexExecutor {
  private client: CetusClmmSDK;
  private sender: Ed25519Keypair;
  private suiClient: SuiClient;

  constructor(network: 'mainnet' | 'testnet', sender: Ed25519Keypair) {
    console.log('Cetus initialized');
    const senderAddress = sender.getPublicKey().toSuiAddress();
    this.client = initCetusSDK({ network: network, wallet: senderAddress });
    this.sender = sender;
    this.suiClient = new SuiClient({ url: getFullnodeUrl(network) });
  }

  async add_liquidity(
    poolId: string,
    amount_a: number,
    amount_b: number,
    decimals_a: number,
    decimals_b: number,
    fix_amount_a: boolean
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

    const coinAmount = new BN(fix_amount_a ? amount_a : amount_b);
    const iscoinA = fix_amount_a;
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

    const input_amount_a = fix_amount_a
      ? coinAmount.toNumber()
      : liquidityInput.tokenMaxA.toNumber();
    const input_amount_b = fix_amount_a
      ? liquidityInput.tokenMaxB.toNumber()
      : coinAmount.toNumber();

    console.log(`Input amount A: ${input_amount_a}, Input amount B: ${input_amount_b}`);

    const addLiquidityParams: AddLiquidityFixTokenParams = {
      coinTypeA: pool.coinTypeA,
      coinTypeB: pool.coinTypeB,
      pool_id: pool.poolAddress,
      tick_lower: lowerTick.toString(),
      tick_upper: upperTick.toString(),
      fix_amount_a,
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

    // Send the transaction
    console.log('Sending transaction...');
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

    console.log('coinAmounts', coinAmounts.coinA.toNumber(), coinAmounts.coinB.toNumber());

    const { tokenMaxA, tokenMaxB } = adjustForCoinSlippage(coinAmounts, slippage, false);
    console.log('tokenMaxA', tokenMaxA.toNumber(), 'tokenMaxB', tokenMaxB.toNumber());

    // get all rewarders of position
    const rewards: any[] = await this.client.Rewarder.posRewardersAmount(
      pool_id,
      pool.position_manager.positions_handle,
      position_id
    );
    const rewardCoinTypes = rewards
      .filter((item) => Number(item.amount_owed) > 0)
      .map((item) => item.coin_address);

    // build close position payload
    const closePositionTransactionPayload =
      await this.client.Position.closePositionTransactionPayload({
        coinTypeA: pool.coinTypeA,
        coinTypeB: pool.coinTypeB,
        pool_id,
        pos_id: position_id,
        min_amount_a: tokenMaxA.toString(),
        min_amount_b: tokenMaxB.toString(),
        rewarder_coin_types: rewardCoinTypes,
        collect_fee: true,
      });

    console.log('closePositionTransactionPayload', closePositionTransactionPayload);

    // send transaction
    console.log('Sending transaction...');
    const tx = await this.client.fullClient.sendTransaction(
      this.sender,
      closePositionTransactionPayload
    );

    console.log('Transaction response:', tx);
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
    console.log(`Creating pool with coin types ${coin_type_a} and ${coin_type_b}`);
    // initialize sqrt_price
    const initialize_sqrt_price = TickMath.priceToSqrtPriceX64(d(0.0001), 6, 6).toString();
    const tick_spacing = 10;
    const current_tick_index = TickMath.sqrtPriceX64ToTickIndex(new BN(initialize_sqrt_price));

    // build tick range
    const tick_lower = TickMath.getPrevInitializableTickIndex(
      new BN(current_tick_index).toNumber(),
      new BN(tick_spacing).toNumber()
    );
    const tick_upper = TickMath.getNextInitializableTickIndex(
      new BN(current_tick_index).toNumber(),
      new BN(tick_spacing).toNumber()
    );

    // input token amount
    const fix_coin_amount = new BN(amount_a);
    // input token amount is token a
    // slippage value 0.05 means 5%
    const slippage = 0.05;

    const cur_sqrt_price = new BN(initialize_sqrt_price);

    // Estimate liquidity and token amount from one amounts
    const liquidityInput = ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(
      tick_lower,
      tick_upper,
      fix_coin_amount,
      fix_amount_a,
      true,
      slippage,
      cur_sqrt_price
    );

    // Estimate  token a and token b amount
    const input_amount_a = fix_amount_a
      ? fix_coin_amount.toNumber()
      : liquidityInput.tokenMaxA.toNumber();
    const input_amount_b = fix_amount_a
      ? liquidityInput.tokenMaxB.toNumber()
      : fix_coin_amount.toNumber();

    console.log(
      `Input amount A: ${input_amount_a}, Input amount B: ${input_amount_b}, Tick lower: ${tick_lower}, Tick upper: ${tick_upper}`
    );

    const coinMetadataA = await this.suiClient.getCoinMetadata({ coinType: coin_type_a })!;
    if (!coinMetadataA) {
      throw new Error('Failed to fetch metadata for coinTypeA');
    }
    const coinMetadataAID = coinMetadataA.id;

    const coinMetadataB = await this.suiClient.getCoinMetadata({ coinType: coin_type_b });
    if (!coinMetadataB) {
      throw new Error('Failed to fetch metadata for coinTypeB');
    }
    const coinMetadataBID = coinMetadataB.id;

    // build creatPoolPayload Payload
    const createPoolPayload = await this.client.Pool.createPoolTransactionPayload({
      amount_a: input_amount_a,
      amount_b: input_amount_b,
      fix_amount_a,
      tick_lower,
      tick_upper,
      metadata_a: coinMetadataAID!,
      metadata_b: coinMetadataBID!,
      slippage,
      tick_spacing,
      initialize_sqrt_price,
      uri: '',
      coinTypeA: coin_type_a,
      coinTypeB: coin_type_b,
    });

    console.log('createPoolPayload', createPoolPayload);

    console.log('Sending transaction...');
    const res = await this.client.fullClient.sendTransaction(this.sender, createPoolPayload);

    console.log('Transaction response:', res);
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
    console.log(`Swapping in pool ${pool_id} with amounts ${amount_a} and ${amount_b}`);
    // fix input token amount
    const coinAmount = new BN(a2b ? amount_a : amount_b);
    // slippage value
    const slippage = Percentage.fromDecimal(d(5));
    // Fetch pool data
    const pool = await this.client.Pool.getPool(pool_id);

    // Estimated amountIn amountOut fee
    const preSwapEstimation: any = await this.client.Swap.preswap({
      pool: pool,
      currentSqrtPrice: pool.current_sqrt_price,
      decimalsA: decimals_a, // coin a 's decimals
      decimalsB: decimals_b, // coin b 's decimals
      a2b,
      byAmountIn: by_amount_in, // fix token a amount
      amount: coinAmount.toString(),
      coinTypeA: pool.coinTypeA,
      coinTypeB: pool.coinTypeB,
    });

    console.log('preSwapEstimation', preSwapEstimation);

    const toAmount = by_amount_in
      ? preSwapEstimation.estimatedAmountOut
      : preSwapEstimation.estimatedAmountIn;

    console.log('coinAmount', coinAmount.toString());
    console.log('toAmount', toAmount.toString());

    const amountLimit = adjustForCoinSlippage(
      { coinA: new BN(a2b ? coinAmount : toAmount), coinB: new BN(a2b ? toAmount : coinAmount) },
      slippage,
      false
    );
    console.log('amountLimit object', amountLimit);

    const amount_limit = a2b ? amountLimit.tokenMaxB : amountLimit.tokenMaxA;
    console.log('amount_limit', amount_limit.toString());

    // build swap Payload
    const swapPayload = await this.client.Swap.createSwapTransactionPayload({
      pool_id: pool.poolAddress,
      coinTypeA: pool.coinTypeA,
      coinTypeB: pool.coinTypeB,
      a2b: a2b,
      by_amount_in: by_amount_in,
      amount: preSwapEstimation.amount.toString(),
      amount_limit: amount_limit.toString(),
    });

    console.log('swapPayload', swapPayload);

    console.log('Sending transaction...');
    const swapTxn = await this.client.fullClient.sendTransaction(this.sender, swapPayload);

    console.log('Transaction response:', swapTxn);
  }
}
