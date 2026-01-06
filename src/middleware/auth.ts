import type { Context } from "hono";
import type { Variables } from "../types/types.js";
import jwt from "jsonwebtoken";
import { ErrorCode } from "../errors/error_codes.js";
import { getUserById } from "../models/users.model.js";
import { getSessionById } from "../models/sessions.model.js";
import { publicRoutes } from "../utilities/publicRoutes.js";



export async function authMiddleware(
  c: Context<{ Variables: Variables }>,
  next: () => Promise<void>,
) {
  let auth = c.req.header("Authorization");
  let path = c.req.path;
  if(publicRoutes.includes(path)){
    return next();
  }

  if (!auth)
    throw new Error(ErrorCode.UNAUTHORIZED);

  const token = auth.replace("Bearer ", "").trim();
  const payload:any = jwt.verify(token, process.env.JWT_SECRET!);

  const res = await getSessionById(payload.sessionId);

  const role = await getUserById(payload.userId);

  if (res === undefined)
    throw new Error(ErrorCode.AUTH_TOKEN_EXPIRED);

  c.set("userId", payload.userId);
  c.set("userRole", role.role);

  await next();
}
