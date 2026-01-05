import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { pool } from "../database/db.js";
import { success } from "../utilities/response.js";
import { HttpStatus } from "../types/http.js";
import { ErrorCode } from "../types/error_codes.js";
import { AppError } from "../errors/app_error.js";
export async function signupController(c) {
    const { email, password } = await c.req.json();
    const requestId = c.req.header("x-request-id") ||
        c.req.header("x-correlation-id");
    const users = await pool.query("SELECT email FROM users");
    for (const user of users.rows) {
        if (user.email === email) {
            throw new AppError(HttpStatus.CONFLICT, ErrorCode.RESOURCE_ALREADY_EXISTS, "User already exists");
        }
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (email, password_hash, role) VALUES ($1,$2)", [email, hash]);
    return success(c, { message: "User created" }, HttpStatus.CREATED);
}
export async function loginController(c) {
    const { email, password } = await c.req.json();
    const requestId = c.req.header("x-request-id") ||
        c.req.header("x-correlation-id");
    const res = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (res.rowCount === 0) {
        throw new AppError(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS, "Invalid username or password");
    }
    const user = res.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
        throw new AppError(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS, "Invalid username or password");
    }
    const sessionId = uuid();
    await pool.query("INSERT INTO sessions (id, user_id, expires_at) VALUES ($1,$2, now()+interval '1 day')", [sessionId, user.id]);
    const token = jwt.sign({ userId: user.id, sessionId }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return success(c, token, HttpStatus.OK);
}
