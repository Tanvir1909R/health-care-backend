import express from "express";
import { initPayment } from "./payment.controller";
const route = express.Router();

route.post("/init-payment", initPayment);

route.get("/:id", );
route.patch("/:id", );
route.delete("/:id", );
route.delete("/soft/:id", );

export const paymentRoute = route;
