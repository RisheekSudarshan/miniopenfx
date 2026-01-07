import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { ErrorCode } from "../errors/error_codes.js";
import { getUserByEmail, createUser } from "../models/users.model.js";
import { createSession } from "../models/sessions.model.js";
export async function signupUserService(email, password) {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new Error(ErrorCode.RESOURCE_ALREADY_EXISTS);
    }
    const hash = await bcrypt.hash(password, 10);
    return createUser(email, hash, "user");
}
export async function loginService(email, password) {
    const user = await getUserByEmail(email);
    if (!user) {
        throw new Error(ErrorCode.INVALID_CREDENTIALS);
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
        throw new Error(ErrorCode.INVALID_CREDENTIALS);
    }
    const sessionId = uuid();
    const token = jwt.sign({
        userId: user.id,
        sessionId,
    }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const d = new Date();
    await createSession(sessionId, user.id, new Date(d.setDate(d.getDate() + 1)));
    return token;
}
