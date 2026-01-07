import { success } from "../utilities/response.js";
import { HttpStatus } from "../utilities/http.js";
import { signupUserService, loginService } from "../services/auth.service.js";
export async function signupController(c) {
    const { email, password } = await c.req.json();
    await signupUserService(email, password);
    return success(c, { message: "User created" }, HttpStatus.CREATED);
}
export async function loginController(c) {
    const { email, password } = await c.req.json();
    const token = await loginService(email, password);
    return success(c, { token: token }, HttpStatus.OK);
}
