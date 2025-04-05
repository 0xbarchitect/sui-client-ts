import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { Secp256r1Keypair } from '@mysten/sui/keypairs/secp256r1';
import { fromB64 } from '@mysten/bcs';

/**
 * Create a keypair from a Sui Wallet private key (suiprivkey format)
 * 
 * @param suiPrivateKey Private key in the format 'suiprivkey...'
 * @returns Keypair instance based on the key type
 */
export function createKeypairFromSuiPrivateKey(suiPrivateKey: string) {
    if (!suiPrivateKey.startsWith('suiprivkey')) {
      throw new Error('Invalid private key format. Expected string starting with "suiprivkey"');
    }
    
    return Ed25519Keypair.fromSecretKey(suiPrivateKey);
  }