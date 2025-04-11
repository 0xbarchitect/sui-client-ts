export interface LendingExecutor {
  deposit(
    coin_type: string,
    decimals: number,
    amount: number,
    isCollateral?: boolean,
    coin_symbol?: string
  ): Promise<void>;

  withdraw(
    coin_type: string,
    decimals: number,
    amount: number,
    isCollateral?: boolean,
    coin_symbol?: string
  ): Promise<void>;

  borrow(coin_type: string, decimals: number, amount: number, coin_symbol?: string): Promise<void>;

  repay(coin_type: string, decimals: number, amount: number, coin_symbol?: string): Promise<void>;
}
