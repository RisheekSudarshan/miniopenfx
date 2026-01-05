import { Hono } from 'hono'
import type { Variables } from '../../types/types.js'
import { authMiddleware } from '../../middleware/auth.js'
import { pool } from '../../database/db.js'
import { assert } from 'console'
import { isString } from '../../utilities/assert.js'
import { creditBalanceController } from '../../controllers/balance.controller.js'

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

app.get('/', creditBalanceController)

export default app
