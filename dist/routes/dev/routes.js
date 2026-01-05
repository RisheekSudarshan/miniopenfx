import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.js";
import { devAddMoneyController } from "../../controllers/dev.controller.js";
const app = new Hono();
app.use('*', authMiddleware);
app.post('/addMoney', devAddMoneyController);
export default app;
