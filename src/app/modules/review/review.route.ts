import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { createReview } from "./review.controller";
const route = express.Router();

route.post('/',auth(UserRole.PATIENT), createReview)

export const reviewRoute = route;
