import express from "express";
import {
  deletePatient,
  getOnePatient,
  getPatient,
  softDeletePatient,
  updatePatient,
} from "./patient.controller";
const route = express.Router();

route.get("/", getPatient);

route.get("/:id", getOnePatient);
route.patch("/:id", updatePatient);
route.delete("/:id", deletePatient);
route.delete("/soft/:id", softDeletePatient);

export const patientRoute = route;
