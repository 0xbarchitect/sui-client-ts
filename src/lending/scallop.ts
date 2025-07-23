import { Scallop, ScallopClient, ScallopQuery } from '@scallop-io/sui-scallop-sdk';
import { LendingExecutor } from './interface';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { BigNumber } from '@firefly-exchange/library-sui';

export class ScallopExecutor implements LendingExecutor {
  private sdk: Scallop;
  private sender: Ed25519Keypair;
  private suiClient: SuiClient;

  private client?: ScallopClient;
  private query?: ScallopQuery;

  constructor(network: 'mainnet' | 'testnet', sender: Ed25519Keypair) {
    this.sender = sender;
    this.suiClient = new SuiClient({ url: getFullnodeUrl(network) });

    this.sdk = new Scallop({
      secretKey: sender.getSecretKey(),
      networkType: network,
      addressId: '67c44a103fe1b8c454eb9699',
    });
  }

  async init(): Promise<void> {
    console.log('Scallop SDK initialized');

    this.client = await this.sdk.createScallopClient();
    this.query = await this.sdk.createScallopQuery();

    console.info('Your wallet:', this.client.walletAddress);
    const obligations = await this.query!.getObligations();
    const obligationData = await this.query!.queryObligation(obligations[0].id);
    console.log('Obligation data:', obligationData);
  }

  async deposit(
    coin_type: string,
    decimals: number,
    amount: number,
    isCollateral?: boolean
  ): Promise<void> {
    console.log('Scallop Deposit function called with parameters:', {
      coin_type,
      amount,
    });
    amount = new BigNumber(amount).toNumber();

    const obligations = await this.query!.getObligations();
    const obligationData = await this.query!.queryObligation(obligations[0].id);
    console.log('Obligation data:', obligationData);

    console.log('depositing...');
    if (isCollateral) {
      const depositResult = await this.client!.depositCollateral(
        coin_type,
        amount,
        true,
        obligations[0].id
      );
      console.log('DepositCollateral result:', depositResult);
    } else {
      const depositResult = await this.client!.deposit(coin_type, amount);
      console.log('Deposit result:', depositResult);
    }
  }

  async withdraw(
    coin_type: string,
    decimals: number,
    amount: number,
    isCollateral?: boolean
  ): Promise<void> {
    console.log('Scallop Withdraw function called with parameters:', {
      coin_type,
      amount,
      decimals,
      isCollateral,
    });
    amount = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(decimals)).toNumber();
    console.log('Withdraw amount after conversion:', amount);

    const lendings = await this.query!.getLendings([coin_type]);
    console.log('Lendings data:', lendings);

    const obligations = await this.query!.getObligations();
    const obligationData = await this.query!.queryObligation(obligations[0].id);
    console.log('Obligation data:', obligationData);

    console.log('withdrawing...');
    if (isCollateral) {
      const withdrawResult = await this.client!.withdrawCollateral(
        coin_type,
        amount,
        true,
        obligations[0].id,
        obligations[0].keyId
      );
      console.log('WithdrawCollateral result:', withdrawResult);
    } else {
      const withdrawResult = await this.client!.withdraw(coin_type, amount);
      console.log('Withdraw result:', withdrawResult);
    }
  }

  async borrow(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Scallop Borrow function called with parameters:', {
      coin_type,
      amount,
    });
    amount = new BigNumber(amount).toNumber();

    const obligations = await this.query!.getObligations();
    const obligationData = await this.query!.queryObligation(obligations[0].id);
    console.log('Obligation data:', obligationData);

    console.log('borrowing...');
    const borrowResult = await this.client!.borrow(
      coin_type,
      amount,
      true,
      obligations[0].id,
      obligations[0].keyId
    );
    console.log('Borrow result:', borrowResult);
  }

  async repay(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Scallop Repay function called with parameters:', {
      coin_type,
      amount,
    });

    const obligations = await this.query!.getObligations();
    const obligationData = await this.query!.queryObligation(obligations[0].id);
    console.log('Obligation data:', obligationData);

    console.log('repaying...');
    const repayResult = await this.client!.repay(
      coin_type,
      amount,
      true,
      obligations[0].id,
      obligations[0].keyId
    );
    console.log('Repay result:', repayResult);
  }

  async queryHF(borrower: string): Promise<void> {
    let portfolio = await this.query!.getUserPortfolio({ walletAddress: borrower });

    console.log('Borrower portfolio:', portfolio);

    console.log('Lendings::');
    portfolio.lendings.forEach((lending) => {
      console.log(`\t${lending.coinType}, amount: ${lending.suppliedCoin}`);
    });

    console.log('Borrows::');
    portfolio.borrowings.forEach((obligation) => {
      console.log('Obligation:', obligation.obligationId);
      console.log('Deposits::');
      obligation.collaterals.forEach((deposit) => {
        console.log(`\t${deposit.coinType}, Amount: ${deposit.depositedCoin.toString()}`);
      });
      console.log('Borrows::');
      obligation.borrowedPools.forEach((borrow) => {
        console.log(`\t${borrow.coinType}, Amount: ${borrow.borrowedCoin.toString()}`);
      });

      console.log('Total collateral in USD:', obligation.totalCollateralInUsd.toString());
      console.log('Total debt in USD:', obligation.totalDebtsInUsd.toString());
      const hf = 1 / obligation.riskLevel;
      console.log('HF:', hf.toString());
    });
  }
}
