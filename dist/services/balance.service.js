import { getUserBalances } from "../models/balances.model";
export async function getBalancebyUserService(userId) {
    return await getUserBalances(userId);
}
