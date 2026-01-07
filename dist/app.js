import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth";
import { ERROR_RESPONSE_MAP } from "./errors/response";
export function createApp() {
    const app = new Hono();
    app.use("*", authMiddleware);
    app.onError((err, c) => {
        console.log(err);
        if (err instanceof Error && err.message in ERROR_RESPONSE_MAP) {
            const errorCode = err.message;
            const { status, body } = ERROR_RESPONSE_MAP[errorCode];
            return c.json(body, status);
        }
        return c.json({ success: false, Message: err, Error: "Unseen Error" }, 500);
    });
    app.notFound((c) => c.json({ success: false, "Message": "Route Not Found" }, 404));
    return app;
}
