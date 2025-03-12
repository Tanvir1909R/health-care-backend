import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { createReview, getReviews } from "./review.controller";
const route = express.Router();

route.post('/',auth(UserRole.PATIENT), createReview)
route.get('/',auth(UserRole.ADMIN,UserRole.SUPER_ADMIN), getReviews)

export const reviewRoute = route;
