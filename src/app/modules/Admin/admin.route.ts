import express from "express";
import {
  deleteAdmin,
  getAdmin,
  getSingleAdmin,
  softDeleteAdmin,
  updateAdmin,
} from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import { adminUpdateZodSchema } from "./admin.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const route = express.Router();

route.get("/", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAdmin);
route.get("/:id", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), getSingleAdmin);
route.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(adminUpdateZodSchema),
  updateAdmin
);
route.delete("/:id", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteAdmin);
route.delete(
  "/soft/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  softDeleteAdmin
);

export const adminRoute = route;
