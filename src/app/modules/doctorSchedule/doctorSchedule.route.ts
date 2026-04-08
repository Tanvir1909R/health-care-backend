import express from "express";
import { createDoctorSchedules, deleteMySchedules, getAllSchedules, getMySchedules } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const route = express.Router();

route.get("/", 
    // auth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT, UserRole.SUPER_ADMIN),
    getAllSchedules);
route.post("/", auth(UserRole.DOCTOR),createDoctorSchedules);

route.get("/my-schedule", auth(UserRole.DOCTOR),getMySchedules);
route.delete("/:id", auth(UserRole.DOCTOR),deleteMySchedules);

export const doctorScheduleRoute = route;
