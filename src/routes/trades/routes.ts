import { createApp } from "../../app.js";
import {
  selfTradeController,
  otherTradeController,
} from "../../controllers/trade.controller.js";

const app = createApp();

app.post("/self", selfTradeController);
app.post("/others", otherTradeController);

export default app;
