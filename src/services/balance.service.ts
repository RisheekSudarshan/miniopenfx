import { getUserBalances } from "../models/balances.model";

export async function getBalancebyUserService(userId: string) {
  return await getUserBalances(userId);
}
