import express from "express";
import {
  changeAppointmentStatus,
  createAppointment,
  getMyAppointment,
} from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const route = express.Router();

route.get(
  "/my-appointment",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  getMyAppointment
);
route.post("/", auth(UserRole.PATIENT), createAppointment);

route.patch(
  "/status/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR),
  changeAppointmentStatus
);
route.delete("/:id");

export const appointmentRoute = route;
