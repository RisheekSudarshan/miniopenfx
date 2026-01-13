import { historyController } from "../../controllers/history.controller.js";
import { createApp } from "../../app.js";

const app = createApp()


app.get("/", historyController);

export default app;
