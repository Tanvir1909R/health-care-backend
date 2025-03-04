import express from "express";
import { getDoctors } from "./doctor.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const route = express.Router();


route.get('/',getDoctors)

export const doctorRoute = route;
