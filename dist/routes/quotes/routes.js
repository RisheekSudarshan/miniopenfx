import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth.js';
import { quoteController } from '../../controllers/quote.controller.js';
const app = new Hono();
app.use('*', authMiddleware);
app.post('/', quoteController);
export default app;
