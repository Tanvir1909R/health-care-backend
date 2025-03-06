import express from "express";
import { createSchedules, getSchedules } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const route = express.Router();

route.post("/", createSchedules);

route.get("/",auth(UserRole.DOCTOR),getSchedules );
route.patch("/:id", );
route.delete("/:id", );
route.delete("/soft/:id",);

export const scheduleRoute = route;
