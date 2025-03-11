import express from "express";
import { initPayment, validatePayment } from "./payment.controller";
const route = express.Router();

route.get("/ipn", validatePayment);
route.post("/init-payment/:appointmentId", initPayment);

export const paymentRoute = route;
