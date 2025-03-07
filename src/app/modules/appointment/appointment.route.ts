import express from "express";
import { createAppointment, getMyAppointment } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const route = express.Router();

route.post("/", auth(UserRole.PATIENT),createAppointment);

route.get("/my-appointment",auth(UserRole.PATIENT,UserRole.DOCTOR), getMyAppointment);
route.get("/:id", );
route.delete("/:id", );

export const appointmentRoute = route;
