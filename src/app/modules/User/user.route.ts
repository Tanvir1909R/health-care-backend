import express, { NextFunction, Request, Response } from "express";
import {
  changeStatus,
  createAdmin,
  createDoctor,
  createPatient,
  getMyProfile,
  getUsers,
  updateProfile,
} from "./user.controller";
import auth from "../../middlewares/auth";
import upload from "../../globalHelperFunction/fileUpload";
import {
  changeStatusZodSchema,
  createAdminZodSchema,
  createDoctorZodSchema,
  createPatientZodSchema,
} from "./user.validation";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";

const route = express.Router();

route.post(
  "/create-admin",
  auth("ADMIN", "SUPER_ADMIN"),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = createAdminZodSchema.parse(JSON.parse(req.body.data));
    return createAdmin(req, res, next);
  }
);
route.post(
  "/create-doctor",
  auth("ADMIN", "SUPER_ADMIN"),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = createDoctorZodSchema.parse(JSON.parse(req.body.data));
    return createDoctor(req, res, next);
  }
);
route.post(
  "/create-patient",
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = createPatientZodSchema.parse(JSON.parse(req.body.data));
    return createPatient(req, res, next);
  }
);

route.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  getMyProfile
);

route.get("/", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), getUsers);
route.patch(
  "/:id/status",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(changeStatusZodSchema),
  changeStatus
);


route.patch(
  "/update-my-profile",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return updateProfile(req, res, next);
  }
);

export const userRoute = route;
