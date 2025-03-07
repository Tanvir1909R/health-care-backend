import express from "express";
import { createSchedules, deleteOneSchedule, getOneSchedule, getSchedules } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const route = express.Router();

route.post("/", createSchedules);

route.get("/",auth(UserRole.DOCTOR),getSchedules );
route.get("/:id", getOneSchedule);
route.delete("/:id", deleteOneSchedule);

export const scheduleRoute = route;
