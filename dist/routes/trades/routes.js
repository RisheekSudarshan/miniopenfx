import { createApp } from "../../app.js";
import { authMiddleware } from "../../middleware/auth.js";
import { selfTradeController, otherTradeController, } from "../../controllers/trade.controller.js";
const app = createApp();
app.use("*", authMiddleware);
app.post("/self", selfTradeController);
app.post("/others", otherTradeController);
export default app;
