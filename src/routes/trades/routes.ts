import { createApp } from "../../app.js";
import {
  TradeController
} from "../../controllers/trade.controller.js";

const app = createApp();

app.post("/", TradeController);

export default app;
