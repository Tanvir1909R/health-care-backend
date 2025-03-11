import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { createPrescription, myPrescription } from "./prescription.controller";
const route = express.Router();

route.get('/my-prescription',auth(UserRole.PATIENT), myPrescription)
route.post('/',auth(UserRole.DOCTOR), createPrescription)

export const prescriptionRoute = route;
