import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth.js';
import { creditBalanceController } from '../../controllers/balance.controller.js';
const app = new Hono();
app.use('*', authMiddleware);
app.get('/', creditBalanceController);
export default app;
