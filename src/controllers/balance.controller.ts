import { pool } from "../database/db"
import { success } from "../utilities/response"
import { Context } from "hono"
import { getUserBalances, upsertBalance } from "../models/balances.model"
import { db } from "../database/client"
import { getBalancebyUserService } from "../services/balance.service"

export async function creditBalanceController(c: Context) {
    const userId = c.get("userId")
    
    let res = await getBalancebyUserService(userId)

    return success(c, { balances: res }, 200)
}
