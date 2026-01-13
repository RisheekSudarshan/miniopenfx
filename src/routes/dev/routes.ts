import { devAddMoneyController } from "../../controllers/dev.controller.js";
import { createApp } from "../../app.js";

const app = createApp();
app.post("/addMoney", devAddMoneyController);

export default app;
