import { creditBalanceController } from "../../controllers/balance.controller.js";
import { createApp } from "../../app.js";

const app = createApp();

app.get("/", creditBalanceController);

export default app;
