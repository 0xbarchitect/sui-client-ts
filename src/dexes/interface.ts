export interface DexExecutor {
  swap(
    pool_id: string,
    amount_a: number,
    amount_b: number,
    decimals_a: number,
    decimals_b: number,
    a2b: boolean,
    by_amount_in: boolean
  ): Promise<void>;

  add_liquidity(
    pool_id: string,
    amount_a: number,
    amount_b: number,
    decimals_a: number,
    decimals_b: number,
    fix_amount_a: boolean
  ): Promise<void>;

  remove_liquidity(pool_id: string, position_id: string): Promise<void>;

  create_pool(
    coin_type_a: string,
    coin_type_b: string,
    decimals_a: number,
    decimals_b: number,
    amount_a: number,
    amount_b: number,
    fix_amount_a: boolean
  ): Promise<void>;
}
