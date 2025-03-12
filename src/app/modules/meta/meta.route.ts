import express from "express";
import { fetchDashboardMetaData } from "./meta.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const route = express.Router();

route.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  fetchDashboardMetaData
);

export const metaRoute = route;
