import { priceController } from "../../controllers/price.controller.js";
import { createApp } from "../../app.js";

const app = createApp();


app.get("/", priceController);

export default app;
