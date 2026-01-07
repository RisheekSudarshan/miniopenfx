import { getUserBalances } from "../models/balances.model";
import { DbLike } from "../types/types";
export async function getBalancebyUserService(db: DbLike, userId: string) {
  return await getUserBalances(db, userId);
}
