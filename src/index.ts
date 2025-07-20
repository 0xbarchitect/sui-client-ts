import { Cetus } from './dexes/cetus';
import { createKeypairFromSuiPrivateKey } from './utils';
import * as dotenv from 'dotenv';
import { CLICommand } from './commands';
import { Turbos } from './dexes/turbos';
import { Bluefin } from './dexes/bluefin';
import { Navi } from './lending/navi';
import { ScallopExecutor } from './lending/scallop';
import { Suilend } from './lending/suilend';

async function main() {
  dotenv.config();
  try {
    const sender = createKeypairFromSuiPrivateKey(process.env.PRIVATE_KEY!);
    console.log('Public address', sender.getPublicKey().toSuiAddress());

    const cetus = new Cetus(process.env.NETWORK! as 'mainnet' | 'testnet', sender);
    const turbos = new Turbos(process.env.NETWORK! as 'mainnet' | 'testnet', sender);
    const bluefin = new Bluefin(process.env.NETWORK! as 'mainnet' | 'testnet', sender);

    const navi = new Navi(process.env.NETWORK! as 'mainnet' | 'testnet', sender);
    const scallop = new ScallopExecutor(process.env.NETWORK! as 'mainnet' | 'testnet', sender);
    await scallop.init();

    const suilend = new Suilend(process.env.NETWORK! as 'mainnet' | 'testnet', sender);
    await suilend.init();

    const handle_swap = async (
      exchange: string,
      pool_id: string,
      amount_a: number,
      amount_b: number,
      decimals_a: number,
      decimals_b: number,
      a2b: boolean,
      by_amount_in: boolean
    ) => {
      console.log('Handle swap with options:', {
        exchange,
        pool_id,
        amount_a,
        amount_b,
        decimals_a,
        decimals_b,
        a2b,
        by_amount_in,
      });

      switch (exchange) {
        case 'cetus':
          await cetus.swap(pool_id, amount_a, amount_b, decimals_a, decimals_b, a2b, by_amount_in);
          break;
        case 'turbos':
          await turbos.swap(pool_id, amount_a, amount_b, decimals_a, decimals_b, a2b, by_amount_in);
          break;
        case 'bluefin':
          await bluefin.swap(
            pool_id,
            amount_a,
            amount_b,
            decimals_a,
            decimals_b,
            a2b,
            by_amount_in
          );
          break;
        default:
          throw new Error(`Exchange ${exchange} not supported`);
      }
    };

    const handle_add_liquidity = async (
      exchange: string,
      pool_id: string,
      amount_a: number,
      amount_b: number,
      decimals_a: number,
      decimals_b: number,
      fix_amount_a: boolean
    ) => {
      console.log('Handle add liquidity with options:', {
        exchange,
        pool_id,
        amount_a,
        amount_b,
        decimals_a,
        decimals_b,
        fix_amount_a,
      });

      switch (exchange) {
        case 'cetus':
          await cetus.add_liquidity(
            pool_id,
            amount_a,
            amount_b,
            decimals_a,
            decimals_b,
            fix_amount_a
          );
          break;
        default:
          throw new Error(`Exchange ${exchange} not supported`);
      }
    };

    const handle_remove_liquidity = async (
      exchange: string,
      pool_id: string,
      position_id: string
    ) => {
      console.log('Handle remove liquidity with options:', {
        exchange,
        pool_id,
        position_id,
      });

      switch (exchange) {
        case 'cetus':
          await cetus.remove_liquidity(pool_id, position_id);
          break;
        default:
          throw new Error(`Exchange ${exchange} not supported`);
      }
    };

    const handle_create_pool = async (
      exchange: string,
      coin_type_a: string,
      coin_type_b: string,
      decimals_a: number,
      decimals_b: number,
      amount_a: number,
      amount_b: number,
      fix_amount_a: boolean
    ) => {
      console.log('Handle create pool with options:', {
        exchange,
        coin_type_a,
        coin_type_b,
        decimals_a,
        decimals_b,
        amount_a,
        amount_b,
        fix_amount_a,
      });

      switch (exchange) {
        case 'cetus':
          await cetus.create_pool(
            coin_type_a,
            coin_type_b,
            decimals_a,
            decimals_b,
            amount_a,
            amount_b,
            fix_amount_a
          );
          break;
        default:
          throw new Error(`Exchange ${exchange} not supported`);
      }
    };

    const handle_deposit = async (
      protocol: string,
      coin_type: string,
      decimals: number,
      amount: number,
      is_collateral: boolean
    ) => {
      console.log('Handle deposit with options:', {
        protocol,
        coin_type,
        decimals,
        amount,
        is_collateral,
      });
      switch (protocol) {
        case 'navi':
          await navi.deposit(coin_type, decimals, amount);
          break;
        case 'scallop':
          await scallop.deposit(coin_type, decimals, amount, is_collateral);
          break;
        case 'suilend':
          await suilend.deposit(coin_type, decimals, amount);
          break;
        default:
          throw new Error(`Protocol ${protocol} not supported`);
      }
    };

    const handle_withdraw = async (
      protocol: string,
      coin_type: string,
      decimals: number,
      amount: number,
      is_collateral: boolean
    ) => {
      console.log('Handle withdraw with options:', {
        protocol,
        coin_type,
        decimals,
        amount,
        is_collateral,
      });
      switch (protocol) {
        case 'navi':
          await navi.withdraw(coin_type, decimals, amount);
          break;
        case 'scallop':
          await scallop.withdraw(coin_type, decimals, amount, is_collateral);
          break;
        case 'suilend':
          await suilend.withdraw(coin_type, decimals, amount);
          break;
        default:
          throw new Error(`Protocol ${protocol} not supported`);
      }
    };

    const handle_borrow = async (
      protocol: string,
      coin_type: string,
      decimals: number,
      amount: number
    ) => {
      console.log('Handle borrow with options:', {
        protocol,
        coin_type,
        decimals,
        amount,
      });

      switch (protocol) {
        case 'navi':
          await navi.borrow(coin_type, decimals, amount);
          break;
        case 'scallop':
          await scallop.borrow(coin_type, decimals, amount);
          break;
        case 'suilend':
          await suilend.borrow(coin_type, decimals, amount);
          break;
        default:
          throw new Error(`Protocol ${protocol} not supported`);
      }
    };

    const handle_repay = async (
      protocol: string,
      coin_type: string,
      decimals: number,
      amount: number
    ) => {
      console.log('Handle repay with options:', {
        protocol,
        coin_type,
        decimals,
        amount,
      });

      switch (protocol) {
        case 'navi':
          await navi.repay(coin_type, decimals, amount);
          break;
        case 'scallop':
          await scallop.repay(coin_type, decimals, amount);
          break;
        case 'suilend':
          await suilend.repay(coin_type, decimals, amount);
          break;
        default:
          throw new Error(`Protocol ${protocol} not supported`);
      }
    };

    const handle_query_hf = async (protocol: string, borrower: string) => {
      console.log('Handle query HF with options:', {
        protocol,
        borrower,
      });

      switch (protocol) {
        case 'navi':
          await navi.queryHF(borrower);
          break;
        case 'scallop':
          await scallop.queryHF(borrower);
          break;
        case 'suilend':
          console.log('Suilend does not support query HF directly');
          break;
        default:
          throw new Error(`Protocol ${protocol} not supported`);
      }
    };

    const cli = new CLICommand(
      handle_swap,
      handle_add_liquidity,
      handle_remove_liquidity,
      handle_create_pool,
      handle_deposit,
      handle_withdraw,
      handle_borrow,
      handle_repay,
      handle_query_hf
    );

    cli.program.parse(process.argv);
  } catch (error) {
    throw new Error(`Error in main function: ${error}`);
  }
}

main().catch(console.error);
