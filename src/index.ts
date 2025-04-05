import { Cetus } from './cetus';
import { createKeypairFromSuiPrivateKey } from './utils';
import * as dotenv from 'dotenv';

async function main() {
  dotenv.config();
  try {
    const sender = createKeypairFromSuiPrivateKey(process.env.PRIVATE_KEY!);
    console.log('Public address', sender.getPublicKey().toSuiAddress());

    const cetus = new Cetus('mainnet', sender);

    const poolId = '0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105';
    //await cetus.add_liquidity(poolId, 1000, 0, true, 6, 9);

    const positionId = '0xada3bb71c42021b679a4729cc8a6f683cb3dfa0e0fb9ea84094b1c55e5372f68';
    await cetus.remove_liquidity(poolId, positionId);
  } catch (error) {
    throw new Error(`Error in main function: ${error}`);
  }
}

main().catch(console.error);
