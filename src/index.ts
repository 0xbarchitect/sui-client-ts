import { Cetus } from './cetus';
import { createKeypairFromSuiPrivateKey } from './utils';
import * as dotenv from 'dotenv';

async function main() {
    dotenv.config();
    try {

    const sender = createKeypairFromSuiPrivateKey(process.env.PRIVATE_KEY!);
    console.log("Public address", sender.getPublicKey().toSuiAddress());

    const cetus = new Cetus('mainnet');
    } catch (error) {
        throw new Error(`Error in main function: ${error}`);
    }
}

main().catch(console.error);