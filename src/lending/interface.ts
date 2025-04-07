export interface LendingExecutor {
  deposit(coin_type: string, decimals: number, amount: number): Promise<void>;
  withdraw(coin_type: string, decimals: number, amount: number): Promise<void>;
  borrow(coin_type: string, decimals: number, amount: number): Promise<void>;
  repay(coin_type: string, decimals: number, amount: number): Promise<void>;
}
