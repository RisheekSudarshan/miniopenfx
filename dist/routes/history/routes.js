import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.js";
import { historyController } from "../../controllers/history.controller.js";
const app = new Hono();
app.use("*", authMiddleware);
app.get("/", historyController);
export default app;
