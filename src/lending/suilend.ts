import {
  SuilendClient,
  LENDING_MARKETS,
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  createObligationIfNoneExists,
  initializeObligations,
  initializeSuilend,
  sendObligationToUser,
} from '@suilend/sdk';
import { ObligationOwnerCap } from '@suilend/sdk/_generated/suilend/lending-market/structs';

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { LendingExecutor } from './interface';
import { BigNumber } from '@firefly-exchange/library-sui';
import { Transaction } from '@mysten/sui/transactions';

export class Suilend implements LendingExecutor {
  private client?: SuilendClient;
  private sender: Ed25519Keypair;
  private suiClient: SuiClient;
  private obligationOwnerCap?: ObligationOwnerCap<string>;
  private obligation?: any;
  private refreshedRawReserves?: any;
  private reserveMap?: any;

  constructor(network: 'mainnet' | 'testnet', sender: Ed25519Keypair) {
    this.sender = sender;
    this.suiClient = new SuiClient({ url: getFullnodeUrl(network) });
  }

  async init(): Promise<void> {
    console.log('Suilend SDK initialized');

    this.client = await SuilendClient.initialize(
      LENDING_MARKET_ID,
      LENDING_MARKET_TYPE,
      this.suiClient
    );

    // const suilendClient = await SuilendClient.initialize(
    //   LENDING_MARKETS[0].id,
    //   LENDING_MARKETS[0].type,
    //   this.suiClient
    // );

    const {
      lendingMarket,
      coinMetadataMap,

      refreshedRawReserves,
      reserveMap,
      reserveCoinTypes,
      reserveCoinMetadataMap,

      rewardCoinTypes,
      activeRewardCoinTypes,
      rewardCoinMetadataMap,
    } = await initializeSuilend(this.suiClient, this.client!);

    //console.log('Lending Market:', lendingMarket);

    const { obligationOwnerCaps, obligations } = await initializeObligations(
      this.suiClient,
      this.client!,
      refreshedRawReserves,
      reserveMap,
      this.sender.getPublicKey().toSuiAddress()
    );
    console.log('ObligationOwnerCaps:', obligationOwnerCaps);
    console.log('Obligations:', obligations);

    this.obligationOwnerCap = obligationOwnerCaps[0];
    this.obligation = obligations[0];
    this.refreshedRawReserves = refreshedRawReserves;
    this.reserveMap = reserveMap;

    console.log('Suilend client initialized:', this.client);
  }

  async deposit(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Suilend Deposit function called with parameters:', {
      coin_type,
      amount,
    });

    const amountBN = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(decimals));
    console.log('Amount in base units:', amountBN.toString());

    // build tx payload
    const transaction = new Transaction();

    try {
      const { obligationOwnerCapId, didCreate } = createObligationIfNoneExists(
        this.client!,
        transaction,
        this.obligationOwnerCap!
      );
      console.log('Obligation Owner Cap ID:', obligationOwnerCapId, didCreate);

      await this.client!.depositIntoObligation(
        this.sender.getPublicKey().toSuiAddress(),
        coin_type,
        amountBN.toString(),
        transaction,
        obligationOwnerCapId
      );

      if (didCreate)
        sendObligationToUser(
          obligationOwnerCapId,
          this.sender.getPublicKey().toSuiAddress(),
          transaction
        );
    } catch (error) {
      console.error('Error in depositIntoObligation:', error);
      throw error;
    }

    console.log('Transaction payload:', transaction);

    console.log('sending transaction...');
    const tx = await this.suiClient.signAndExecuteTransaction({
      signer: this.sender,
      transaction,
      options: {
        showBalanceChanges: true,
        showEffects: true,
        showInput: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });
    console.log('Transaction result:', tx);
  }

  async withdraw(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Suilend Withdraw function called with parameters:', {
      coin_type,
      amount,
    });
    const amountBN = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(decimals));
    console.log('Amount in base units:', amountBN.toString());

    const transaction = new Transaction();

    try {
      await this.client!.withdrawAndSendToUser(
        this.sender.getPublicKey().toSuiAddress(),
        this.obligationOwnerCap!.id,
        this.obligation.id,
        coin_type,
        amountBN.toString(),
        transaction
      );
    } catch (err) {
      console.log('Error in withdrawAndSendToUser:', err);
      throw err;
    }

    console.log('Transaction payload:', transaction);

    console.log('sending transaction...');
    const tx = await this.suiClient.signAndExecuteTransaction({
      signer: this.sender,
      transaction,
      options: {
        showBalanceChanges: true,
        showEffects: true,
        showInput: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });
    console.log('Transaction result:', tx);
  }

  async borrow(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Suilend Borrow function called with parameters:', {
      coin_type,
      amount,
    });
    const amountBN = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(decimals));
    console.log('Amount in base units:', amountBN.toString());

    const transaction = new Transaction();

    try {
      await this.client!.borrowAndSendToUser(
        this.sender.getPublicKey().toSuiAddress(),
        this.obligationOwnerCap!.id,
        this.obligation.id,
        coin_type,
        amountBN.toString(),
        transaction
      );
    } catch (err) {
      console.log('Error in borrowAndSendToUser:', err);
      throw err;
    }

    console.log('Transaction payload:', transaction);

    console.log('sending transaction...');
    const tx = await this.suiClient.signAndExecuteTransaction({
      signer: this.sender,
      transaction,
      options: {
        showBalanceChanges: true,
        showEffects: true,
        showInput: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });
    console.log('Transaction result:', tx);
  }

  async repay(coin_type: string, decimals: number, amount: number): Promise<void> {
    console.log('Suilend Repay function called with parameters:', {
      coin_type,
      amount,
    });
    const amountBN = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(decimals));
    console.log('Amount in base units:', amountBN.toString());

    const transaction = new Transaction();

    try {
      await this.client!.repayIntoObligation(
        this.sender.getPublicKey().toSuiAddress(),
        this.obligation.id,
        coin_type,
        amountBN.toString(),
        transaction
      );
    } catch (err) {
      console.log('Error in repayIntoObligation:', err);
      throw err;
    }

    console.log('Transaction payload:', transaction);

    console.log('sending transaction...');
    const tx = await this.suiClient.signAndExecuteTransaction({
      signer: this.sender,
      transaction,
      options: {
        showBalanceChanges: true,
        showEffects: true,
        showInput: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });
    console.log('Transaction result:', tx);
  }

  async queryHF(borrower: string): Promise<void> {
    console.log('Suilend queryHF function called with borrower:', borrower);

    const { obligationOwnerCaps, obligations } = await initializeObligations(
      this.suiClient,
      this.client!,
      this.refreshedRawReserves!,
      this.reserveMap!,
      borrower
    );

    console.log('ObligationOwnerCaps:', obligationOwnerCaps);
    console.log('Obligations:', obligations);

    console.log('Deposits::');
    obligations[0].deposits.forEach((deposit: any) => {
      console.log(
        `\tCoin Type: ${deposit.coinType}, Amount: ${deposit.depositedAmount.toString()}`
      );
    });

    console.log('Borrows::');
    obligations[0].borrows.forEach((borrow: any) => {
      console.log(`\tCoin Type: ${borrow.coinType}, Amount: ${borrow.borrowedAmount.toString()}`);
    });

    console.log('');
    console.log('CollateralValueUsd', obligations[0].unhealthyBorrowValueUsd.toString());
    console.log('DebtValueUsd', obligations[0].weightedBorrowsUsd.toString());

    const hf: BigNumber = obligations[0].unhealthyBorrowValueUsd.div(
      obligations[0].weightedBorrowsUsd
    );
    console.log('HF', hf.toString());
  }
}
