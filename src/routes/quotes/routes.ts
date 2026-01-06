import { authMiddleware } from "../../middleware/auth.js";
import { quoteController } from "../../controllers/quote.controller.js";
import { createApp } from "../../app.js";

const app = createApp()
app.use("*", authMiddleware);

app.post("/", quoteController);

export default app;
