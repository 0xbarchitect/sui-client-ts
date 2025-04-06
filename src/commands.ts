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

export class CLICommand {
  program: Command;
  private swapHandler: SwapHandler;

  constructor(swapHandler: SwapHandler) {
    this.program = new Command();
    this.swapHandler = swapHandler;

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
      .option('--a2b', 'Swap from token A to token B', true)
      .option('--by-amount-in', 'Swap by amount in', true)
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
          options.a2b,
          options.byAmountIn
        );
      });

    dexCommand
      .command('add-liquidity')
      .description('Add liquidity to a pool')
      .option('--token1 <token>', 'First token')
      .option('--token2 <token>', 'Second token')
      .option('--amount1 <amount>', 'Amount of first token')
      .option('--amount2 <amount>', 'Amount of second token')
      .action((options) => {
        console.log('Adding liquidity with options:', options);
        // Implement add liquidity logic
      });

    dexCommand
      .command('remove-liquidity')
      .description('Remove liquidity from a pool')
      .option('-p, --pool <address>', 'Pool address')
      .option('-a, --amount <amount>', 'LP token amount to remove')
      .action((options) => {
        console.log('Removing liquidity with options:', options);
        // Implement remove liquidity logic
      });

    dexCommand
      .command('create-pool')
      .description('Create a new liquidity pool')
      .option('--token1 <token>', 'First token')
      .option('--token2 <token>', 'Second token')
      .action((options) => {
        console.log('Creating pool with options:', options);
        // Implement create pool logic
      });

    // Lending Command Group
    const lendingCommand = this.program
      .command('lending')
      .description('Lending related operations');

    lendingCommand
      .command('deposit')
      .description('Deposit assets')
      .option('-t, --token <token>', 'Token to deposit')
      .option('-a, --amount <amount>', 'Amount to deposit')
      .action((options) => {
        console.log('Depositing with options:', options);
        // Implement deposit logic
      });

    lendingCommand
      .command('withdraw')
      .description('Withdraw assets')
      .option('-t, --token <token>', 'Token to withdraw')
      .option('-a, --amount <amount>', 'Amount to withdraw')
      .action((options) => {
        console.log('Withdrawing with options:', options);
        // Implement withdraw logic
      });

    lendingCommand
      .command('borrow')
      .description('Borrow assets')
      .option('-t, --token <token>', 'Token to borrow')
      .option('-a, --amount <amount>', 'Amount to borrow')
      .action((options) => {
        console.log('Borrowing with options:', options);
        // Implement borrow logic
      });

    lendingCommand
      .command('repay')
      .description('Repay borrowed assets')
      .option('-t, --token <token>', 'Token to repay')
      .option('-a, --amount <amount>', 'Amount to repay')
      .action((options) => {
        console.log('Repaying with options:', options);
        // Implement repay logic
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
  }
}
