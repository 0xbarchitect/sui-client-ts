import { initCetusSDK } from "@cetusprotocol/cetus-sui-clmm-sdk";

export class Cetus {
    private client: any;

    constructor(network: 'mainnet' | 'testnet') {
        console.log('Cetus initialized');
        this.client = initCetusSDK({network: network});
    }
    
    async add_liquidity(poolId: string, amount_a: number, amount_b: number, fixed_amount_a: boolean, decimals_a: number, decimals_b: number): Promise<void> {
        console.log(`Adding liquidity to pool ${poolId} with amounts ${amount_a} and ${amount_b}`);
        // Implement the logic to add liquidity here

    }
}