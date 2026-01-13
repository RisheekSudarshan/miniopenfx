import { success } from "../utilities/response";
import { getBalancebyUserService } from "../services/balance.service";
export async function creditBalanceController(c) {
    const userId = c.get("userId");
    const res = await getBalancebyUserService(userId);
    return success(c, { balances: res }, 200);
}
