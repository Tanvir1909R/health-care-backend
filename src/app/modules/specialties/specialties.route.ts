import express, { NextFunction, Request, Response } from "express";
import upload from "../../globalHelperFunction/fileUpload";
import { createSpecialties, deleteSpecialties, getSpecialties } from "./specialties.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { createSpecialtiesZodSchema } from "./specialties.validation";
const route = express.Router();

route.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = createSpecialtiesZodSchema.parse(JSON.parse(req.body.data));
    return createSpecialties(req, res, next);
  }
);

route.get('/',getSpecialties)
route.delete('/:id',auth(UserRole.SUPER_ADMIN,UserRole.ADMIN,UserRole.DOCTOR),deleteSpecialties)

export const specialtiesRoute = route;
