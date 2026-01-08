import { quoteController } from "../../controllers/quote.controller.js";
import { createApp } from "../../app.js";

const app = createApp()
app.post("/", quoteController);

export default app;
