import {
  signupController,
  loginController,
} from "../../controllers/auth.controller.js";
import { createApp } from "../../app.js";

const app = createApp();

app.post("/signup", signupController);
app.post("/login", loginController);

export default app;
