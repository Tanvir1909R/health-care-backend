import express from "express";
import { changePassword, forgetPassword, loginUser, refreshToken, resetPassword } from "./auth.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const route = express.Router();

route.post("/login", loginUser);
route.post("/refresh-token", refreshToken);
route.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  changePassword
);
route.post('/forget-password', forgetPassword)
route.post('/reset-password', resetPassword)

export const authRoute = route;
