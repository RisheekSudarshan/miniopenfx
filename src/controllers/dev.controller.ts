import { Context } from "hono"
import { pool } from "../database/db"
import { isString, isNumber } from "../utilities/assert.js"
import { createLedgerEntry } from "../models/ledger_entries.model"
import { devAddMoneyService } from "../services/dev.service"

export async function devAddMoneyController(c: Context){
    const userId = c.get('userId')
    const role = c.get('userRole')

    const { currency, amount, reciverId } = await c.req.json()


    devAddMoneyService(reciverId, currency, amount, userId)      
    return c.json({
    "success": true,
    "data": "Credited!"}, 201)


}