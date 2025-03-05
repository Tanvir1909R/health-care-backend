import express from "express";
import { deleteDoctor, getDoctors, getOneDoctor, softDeleteDoctor, updateDoctor } from "./doctor.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const route = express.Router();


route.get('/',getDoctors)

route.get('/:id',getOneDoctor)
route.patch('/:id',updateDoctor)
route.delete('/:id',deleteDoctor)
route.delete('/soft/:id',softDeleteDoctor)

export const doctorRoute = route;
