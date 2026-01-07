import { success } from "../utilities/response.js";
import { HttpStatus } from "../utilities/http.js";
import { Context } from "hono";
import { signupUserService, loginService } from "../services/auth.service.js";
import { DbLike } from "../types/types.js";
import { createDb } from "../database/client.js";

export async function signupController(c: Context) {
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const { email, password } = await c.req.json();

  await signupUserService(db, email, password);

  return success(c, { message: "User created" }, HttpStatus.CREATED);
}

export async function loginController(c: Context) {
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const { email, password } = await c.req.json();

  const token = await loginService(db, email, password);

  return success(c, { token: token }, HttpStatus.OK);
}
