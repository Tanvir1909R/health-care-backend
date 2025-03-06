import express from "express";
import { createDoctorSchedules } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const route = express.Router();

route.post("/", auth(UserRole.DOCTOR),createDoctorSchedules);

route.get("/:id", );
route.patch("/:id", );
route.delete("/:id", );
route.delete("/soft/:id",);

export const doctorScheduleRoute = route;
