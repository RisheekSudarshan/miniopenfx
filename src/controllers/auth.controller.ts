import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { v4 as uuid } from "uuid"
import { pool } from "../database/db.js"
import { success } from "../utilities/response.js"
import { HttpStatus } from "../types/http.js"
import { ErrorCode } from "../types/error_codes.js"
import { Context } from "hono"
import { AppError } from "../errors/app_error.js"
import { signupUserService, loginService } from "../services/auth.service.js"

export async function signupController(c: Context) {
  const { email, password } = await c.req.json()

  signupUserService(email, password)

  return success(
    c,
    { message: "User created" },
    HttpStatus.CREATED
  )
}

export async function loginController(c: Context) {
  const { email, password } = await c.req.json()

  let token = await loginService(email, password)
  
  return success(c, {token:token}, HttpStatus.OK)
}
