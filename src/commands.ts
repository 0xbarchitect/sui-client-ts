import { Command } from 'commander';
import { Cetus } from './dexes/cetus';
import { DexExecutor } from './dexes/interface';

type SwapHandler = (
  exchange: string,
  pool_id: string,
  amount_a: number,
  amount_b: number,
  decimals_a: number,
  decimals_b: number,
  a2b: boolean,
  by_amount_in: boolean
) => Promise<void>;

type AddLiquidityHandler = (
  exchange: string,
  pool_id: string,
  amount_a: number,
  amount_b: number,
  decimals_a: number,
  decimals_b: number,
  fix_amount_a: boolean
) => Promise<void>;

type RemoveLiquidityHandler = (
  exchange: string,
  pool_id: string,
  position_id: string
) => Promise<void>;

type CreatePoolHandler = (
  exchange: string,
  coin_type_a: string,
  coin_type_b: string,
  decimals_a: number,
  decimals_b: number,
  amount_a: number,
  amount_b: number,
  fix_amount_a: boolean
) => Promise<void>;

type DepositHandler = (
  protocol: string,
  coin_type: string,
  decimals: number,
  amount: number,
  is_collateral: boolean,
  coin_symbol: string
) => Promise<void>;

type WithdrawHandler = (
  protocol: string,
  coin_type: string,
  decimals: number,
  amount: number,
  is_collateral: boolean,
  coin_symbol: string
) => Promise<void>;

type BorrowHandler = (
  protocol: string,
  coin_type: string,
  decimals: number,
  amount: number,
  coin_symbol: string
) => Promise<void>;

type RepayHandler = (
  protocol: string,
  coin_type: string,
  decimals: number,
  amount: number,
  coin_symbol: string
) => Promise<void>;

type TxEventsHandler = (digest: string) => Promise<void>;

export class CLICommand {
  program: Command;

  private swapHandler: SwapHandler;
  private addLiquidityHandler: AddLiquidityHandler;
  private removeLiquidityHandler: RemoveLiquidityHandler;
  private createPoolHandler: CreatePoolHandler;

  private depositHandler: DepositHandler;
  private withdrawHandler: WithdrawHandler;
  private borrowHandler: BorrowHandler;
  private repayHandler: RepayHandler;

  private txEventsHandler: TxEventsHandler;

  constructor(
    swapHandler: SwapHandler,
    addLiquidityHandler: AddLiquidityHandler,
    removeLiquidityHandler: RemoveLiquidityHandler,
    createPoolHandler: CreatePoolHandler,
    depositHandler: DepositHandler,
    withdrawHandler: WithdrawHandler,
    borrowHandler: BorrowHandler,
    repayHandler: RepayHandler,
    txEventsHandler: TxEventsHandler
  ) {
    this.program = new Command();

    this.swapHandler = swapHandler;
    this.addLiquidityHandler = addLiquidityHandler;
    this.removeLiquidityHandler = removeLiquidityHandler;
    this.createPoolHandler = createPoolHandler;

    this.depositHandler = depositHandler;
    this.withdrawHandler = withdrawHandler;
    this.borrowHandler = borrowHandler;
    this.repayHandler = repayHandler;

    this.txEventsHandler = txEventsHandler;

    this.program = this.program.version('1.0.0').description('DeFi CLI for SUI blockchain');

    // DEX Command Group
    const dexCommand = this.program.command('dex').description('DEX related operations');

    dexCommand
      .command('swap')
      .description('Swap tokens')
      .option(
        '--exchange <exchange>',
        'Exchange name, e.g., cetus, turbos, kriya, flowx, bluefin, bluemove'
      )
      .option('--pool-id <address>', 'Pool address')
      .option('--amount-a <amount>', 'Amount of first token', parseFloat)
      .option('--amount-b <amount>', 'Amount of second token', parseFloat)
      .option('--decimals-a <decimals>', 'Decimals of first token', '9')
      .option('--decimals-b <decimals>', 'Decimals of second token', '9')
      .option('--a2b', 'Swap from token A to token B')
      .option('--by-amount-in', 'Swap by amount in')
      .action(async (options) => {
        console.log('CLI swap with options:', options);
        // Implement swap logic
        await this.swapHandler(
          options.exchange,
          options.poolId,
          options.amountA,
          options.amountB,
          options.decimalsA,
          options.decimalsB,
          options.a2b ? options.a2b : false,
          options.byAmountIn ? options.byAmountIn : false
        );
      });

    dexCommand
      .command('add-liquidity')
      .description('Add liquidity to a pool')
      .option('--exchange <exchange>', 'Exchange name')
      .option('--pool-id <address>', 'Pool address')
      .option('--amount-a <amount>', 'Amount of first token')
      .option('--amount-b <amount>', 'Amount of second token')
      .option('--decimals-a <decimals>', 'Decimals of first token', '9')
      .option('--decimals-b <decimals>', 'Decimals of second token', '9')
      .option('--fix-amount-a', 'Fix amount of first token')
      .action(async (options) => {
        console.log('Adding liquidity with options:', options);
        // Implement add liquidity logic
        await this.addLiquidityHandler(
          options.exchange,
          options.poolId,
          options.amountA,
          options.amountB,
          options.decimalsA,
          options.decimalsB,
          options.fixAmountA ? options.fixAmountA : false
        );
      });

    dexCommand
      .command('remove-liquidity')
      .description('Remove liquidity from a pool')
      .option('--exchange <exchange>', 'Exchange name')
      .option('--pool-id <address>', 'Pool ID')
      .option('--position-id <address>', 'Position ID')
      .action(async (options) => {
        console.log('Removing liquidity with options:', options);
        // Implement remove liquidity logic
        await this.removeLiquidityHandler(options.exchange, options.poolId, options.positionId);
      });

    dexCommand
      .command('create-pool')
      .description('Create a new liquidity pool')
      .option('--exchange <exchange>', 'Exchange name')
      .option('--coin-type-a <type>', 'Coin type of first token')
      .option('--coin-type-b <type>', 'Coin type of second token')
      .option('--decimals-a <decimals>', 'Decimals of first token', '9')
      .option('--decimals-b <decimals>', 'Decimals of second token', '9')
      .option('--amount-a <amount>', 'Amount of first token')
      .option('--amount-b <amount>', 'Amount of second token')
      .option('--fix-amount-a', 'Fix amount of first token')
      .action(async (options) => {
        console.log('Creating pool with options:', options);
        // Implement create pool logic
        await this.createPoolHandler(
          options.exchange,
          options.coinTypeA,
          options.coinTypeB,
          options.decimalsA,
          options.decimalsB,
          options.amountA,
          options.amountB,
          options.fixAmountA
        );
      });

    // Lending Command Group
    const lendingCommand = this.program
      .command('lending')
      .description('Lending related operations');

    lendingCommand
      .command('deposit')
      .description('Deposit assets')
      .option('--protocol <protocol>', 'Protocol name')
      .option('--coin-type <coin type>', 'Coin type to deposit')
      .option('--decimals <decimals>', 'Coin decimals')
      .option('--amount <amount>', 'Amount to deposit')
      .option('--is-collateral', 'Is collateral')
      .option('--coin-symbol <symbol>', 'Coin symbol')
      .action(async (options) => {
        console.log('Depositing with options:', options);
        // Implement deposit logic
        await this.depositHandler(
          options.protocol,
          options.coinType,
          options.decimals,
          options.amount,
          options.isCollateral,
          options.coinSymbol
        );
      });

    lendingCommand
      .command('withdraw')
      .description('Withdraw assets')
      .option('--protocol <protocol>', 'Protocol name')
      .option('--coin-type <coin type>', 'Coin type to withdraw')
      .option('--decimals <decimals>', 'Coin decimals', parseInt)
      .option('--amount <amount>', 'Amount to withdraw', parseFloat)
      .option('--is-collateral', 'Is collateral', false)
      .option('--coin-symbol <symbol>', 'Coin symbol')
      .action(async (options) => {
        console.log('Withdrawing with options:', options);
        // Implement withdraw logic
        await this.withdrawHandler(
          options.protocol,
          options.coinType,
          options.decimals,
          options.amount,
          options.isCollateral,
          options.coinSymbol
        );
      });

    lendingCommand
      .command('borrow')
      .description('Borrow assets')
      .option('--protocol <protocol>', 'Protocol name')
      .option('--coin-type <coin type>', 'Coin type to borrow')
      .option('--decimals <decimals>', 'Coin decimals')
      .option('--amount <amount>', 'Amount to borrow')
      .option('--coin-symbol <symbol>', 'Coin symbol')
      .action(async (options) => {
        console.log('Borrowing with options:', options);
        // Implement borrow logic
        await this.borrowHandler(
          options.protocol,
          options.coinType,
          options.decimals,
          options.amount,
          options.coinSymbol
        );
      });

    lendingCommand
      .command('repay')
      .description('Repay borrowed assets')
      .option('--protocol <protocol>', 'Protocol name')
      .option('--coin-type <coin type>', 'Coin type to repay')
      .option('--decimals <decimals>', 'Coin decimals')
      .option('--amount <amount>', 'Amount to repay')
      .option('--coin-symbol <symbol>', 'Coin symbol')
      .action(async (options) => {
        console.log('Repaying with options:', options);
        // Implement repay logic
        await this.repayHandler(
          options.protocol,
          options.coinType,
          options.decimals,
          options.amount,
          options.coinSymbol
        );
      });

    lendingCommand
      .command('liquidate')
      .description('Liquidate undercollateralized position')
      .option('-p, --position <address>', 'Position address')
      .option('-t, --token <token>', 'Token to receive as collateral')
      .action((options) => {
        console.log('Liquidating with options:', options);
        // Implement liquidate logic
      });

    // Query command groups
    const queryCommand = this.program.command('query').description('Query related operations');

    queryCommand
      .command('tx-events')
      .description('Get transaction events')
      .option('--digest <digest>', 'Transaction digest')
      .action(async (options) => {
        console.log('Getting transaction events with options:', options);
        // Implement tx events logic
        await this.txEventsHandler(options.digest);
      });
  }
}
