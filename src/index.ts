import { Cetus } from './dexes/cetus';
import { createKeypairFromSuiPrivateKey } from './utils';
import * as dotenv from 'dotenv';
import { CLICommand } from './commands';
import { Turbos } from './dexes/turbos';

async function main() {
  dotenv.config();
  try {
    const sender = createKeypairFromSuiPrivateKey(process.env.PRIVATE_KEY!);
    console.log('Public address', sender.getPublicKey().toSuiAddress());

    const cetus = new Cetus(process.env.NETWORK! as 'mainnet' | 'testnet', sender);
    const turbos = new Turbos(process.env.NETWORK! as 'mainnet' | 'testnet', sender);

    //const pool_id = '0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105';
    //await cetus.add_liquidity(poolId, 1000_000, 0, true, 6, 9);

    //const position_id = '0xada3bb71c42021b679a4729cc8a6f683cb3dfa0e0fb9ea84094b1c55e5372f68';
    //await cetus.remove_liquidity(poolId, positionId);

    // const coin_type_a =
    //   '0xc7cebc639a77ae2a9917b63a23e34feb454fecb7fc9682864c2bedf7220091fd::my_coin::MY_COIN';
    // const coin_type_b = '0x2::sui::SUI';

    //await cetus.create_pool(coin_type_a, coin_type_b, 6, 6, 2000_000_000, 100_000_000, true);

    // const amount_a = 1_000_000;
    // const amount_b = 0;
    // const decimals_a = 6;
    // const decimals_b = 9;
    // const a2b = true;
    // const by_amount_in = true;

    // await cetus.swap(pool_id, amount_a, amount_b, decimals_a, decimals_b, a2b, by_amount_in);

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

    const cli = new CLICommand(
      handle_swap,
      handle_add_liquidity,
      handle_remove_liquidity,
      handle_create_pool
    );

    cli.program.parse(process.argv);
  } catch (error) {
    throw new Error(`Error in main function: ${error}`);
  }
}

main().catch(console.error);
