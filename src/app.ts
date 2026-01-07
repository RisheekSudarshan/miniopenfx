import { Hono } from "hono";
import { Context } from "hono";
import { Variables } from "hono/types";
import { authMiddleware } from "./middleware/auth";
import { ErrorCode } from "./errors/error_codes";
import { ERROR_RESPONSE_MAP } from "./errors/response";

export function createApp(){
    const app = new Hono<{ Variables: Variables}>();
    app.use("*", authMiddleware);
    app.onError((err, c: Context) => {
      console.log(err)
if (err instanceof Error && err.message in ERROR_RESPONSE_MAP) {
  const errorCode = err.message as ErrorCode;
  const { status, body } = ERROR_RESPONSE_MAP[errorCode];

  return c.json(body, status);
}

return c.json({success:false, Message: err, Error: "Unseen Error"}, 500)
    });

    app.notFound((c)=> c.json({success:false, "Message": "Route Not Found"}, 404),
);

return app;
}