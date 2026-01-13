import { HttpStatus } from "./http.js";
export function success(c, data, status = HttpStatus.OK) {
    return c.json({ success: true, data: data }, status);
}
