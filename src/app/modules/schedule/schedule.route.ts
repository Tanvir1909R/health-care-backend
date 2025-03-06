import express from "express";
import { createSchedules } from "./schedule.controller";
const route = express.Router();

route.post("/", createSchedules);

route.get("/:id", );
route.patch("/:id", );
route.delete("/:id", );
route.delete("/soft/:id",);

export const scheduleRoute = route;
