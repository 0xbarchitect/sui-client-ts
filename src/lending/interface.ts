export interface LendingExecutor {
  deposit(coin_type: string, decimals: number, amount: number): Promise<void>;
  withdraw(coin_type: string, decimals: number, amount: number): Promise<void>;
}
