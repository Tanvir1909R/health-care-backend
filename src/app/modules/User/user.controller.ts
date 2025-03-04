import { UserRole } from "@prisma/client";
import { NextFunction, Request, RequestHandler, Response } from "express";
import bcrypt from "bcrypt";
import { httpCode, prisma } from "../../../app";
import { uploadCloudinary } from "../../globalHelperFunction/fileUpload";
import getFilterCondition from "../../globalHelperFunction/getFilterCondition";
import calculatePagination from "../../globalHelperFunction/calculatePagination";
import pick from "../../globalHelperFunction/pick";
import sendResponse from "../../globalHelperFunction/sendResponse";
import catchAsync from "../../globalHelperFunction/catchAsync";
import status from "http-status";

export const createAdmin: RequestHandler = async (req, res) => {
  try {
    const file = req.file;
    const data = req.body;
    if (file) {
      const fileInfo: any = await uploadCloudinary(file);
      data.admin.profilePhoto = fileInfo.secure_url;
    }

    const hashPassword = bcrypt.hashSync(data.password, 12);
    const userData = {
      email: data.admin.email,
      password: hashPassword,
      role: UserRole.ADMIN,
    };

    const result = await prisma.$transaction(async (tc) => {
      await tc.user.create({
        data: userData,
      });
      const createAdminData = await tc.admin.create({
        data: data.admin,
      });

      return createAdminData;
    });

    res.status(200).json({
      success: true,
      message: "Admin create successful",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "something went wrong",
      error: (error as Error).name,
    });
  }
};
export const createDoctor: RequestHandler = async (req, res) => {
  try {
    const file = req.file;
    const data = req.body;
    if (file) {
      const fileInfo: any = await uploadCloudinary(file);
      data.doctor.profilePhoto = fileInfo.secure_url;
    }

    const hashPassword = bcrypt.hashSync(data.password, 12);
    const userData = {
      email: data.doctor.email,
      password: hashPassword,
      role: UserRole.DOCTOR,
    };

    const result = await prisma.$transaction(async (tc) => {
      await tc.user.create({
        data: userData,
      });
      const createDoctorData = await tc.doctor.create({
        data: data.doctor,
      });

      return createDoctorData;
    });

    res.status(200).json({
      success: true,
      message: "Doctor create successful",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "something went wrong",
      error: (error as Error).name,
    });
  }
};
export const createPatient: RequestHandler = async (req, res) => {
  try {
    const file = req.file;
    const data = req.body;
    if (file) {
      const fileInfo: any = await uploadCloudinary(file);
      data.patient.profilePhoto = fileInfo.secure_url;
    }

    const hashPassword = bcrypt.hashSync(data.password, 12);
    const userData = {
      email: data.patient.email,
      password: hashPassword,
      role: UserRole.PATIENT,
    };

    const result = await prisma.$transaction(async (tc) => {
      await tc.user.create({
        data: userData,
      });
      const createPatientData = await tc.patient.create({
        data: data.patient,
      });

      return createPatientData;
    });

    res.status(200).json({
      success: true,
      message: "patient create successful",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "something went wrong",
      error: (error as Error).name,
    });
  }
};
export const getUsers: RequestHandler = async (req, res) => {
  try {
    const andCondition = getFilterCondition(
      req.query,
      ["search", "email", "role", "status"],
      ["email"],
      false
    );
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const { limit, skip, sortBy, sortOrder, page } =
      calculatePagination(options);
    const result = await prisma.user.findMany({
      where: andCondition,
      skip,
      take:limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select:{
        email:true,
        id:true,
        role:true,
        status:true,
        needPasswordChange:true,
        createAt:true,
        updateAt:true,
        admin:true,
        patient:true,
        doctor:true
      },
    });

    sendResponse(res,{
      statusCode:httpCode.OK,
      success: true,
      message: "patient create successful",
      data: result,
      meta:{
        limit,
        page
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "something went wrong",
      error: (error as Error).name,
    });
  }
};

export const changeStatus:RequestHandler = catchAsync(async(req,res)=>{
  const id = req.params.id;
  const data = req.body;
  await prisma.user.findUniqueOrThrow({
    where:{
      id
    }
  })
  const result = await prisma.user.update({
    where:{
      id
    },
    data
  })
  sendResponse(res,{
    statusCode:httpCode.OK,
    success:true,
    message:"status update successfully",
    data:result
  })
})

export const getMyProfile = async(req:Request,res:Response,next:NextFunction)=>{
  try {
      const user = req.user;

      const userInfo = await prisma.user.findUniqueOrThrow({
        where:{
          email:user?.email
        },
        select:{
          id:true,
          email:true,
          needPasswordChange:true,
          role:true,
          status:true
        }
      })
      let profileInfo;
      switch (user?.role) {
        case UserRole.SUPER_ADMIN:
          profileInfo = await prisma.admin.findUnique({
            where:{
              email: user.email
            }
          })
          break;
        case UserRole.ADMIN:
          profileInfo = await prisma.admin.findUnique({
            where:{
              email: user.email
            }
          })
          break;
        case UserRole.DOCTOR:
          profileInfo = await prisma.doctor.findUnique({
            where:{
              email: user.email
            }
          })
          break;
        case UserRole.PATIENT:
          profileInfo = await prisma.patient.findUnique({
            where:{
              email: user.email
            }
          })
          break;
      
        default:
          break;
      }

      const data = {...userInfo,...profileInfo}

      res.status(httpCode.OK).json({
        status:httpCode.OK,
        message:"user get successful",
        data
      })
      
  } catch (error) {
    next(error)
  }
}


export const updateProfile = async(req:Request,res:Response,next:NextFunction)=>{
  try {
      const user = req.user;
      const file = req.file;

      if(file){
        const uploadData:any = await uploadCloudinary(file)
        req.body.profilePhoto = uploadData?.secure_url
      }

      const userInfo = await prisma.user.findUniqueOrThrow({
        where:{
          email:user?.email
        }
      })
      let profileInfo;
      switch (user?.role) {
        case UserRole.SUPER_ADMIN:
          profileInfo = await prisma.admin.update({
            where:{
              email: user.email
            },
            data: req.body
          })
          break;
        case UserRole.ADMIN:
          profileInfo = await prisma.admin.update({
            where:{
              email: user.email
            },
            data: req.body
          })
          break;
        case UserRole.DOCTOR:
          profileInfo = await prisma.doctor.update({
            where:{
              email: user.email
            },
            data: req.body
          })
          break;
        case UserRole.PATIENT:
          profileInfo = await prisma.patient.update({
            where:{
              email: user.email
            },
            data: req.body
          })
          break;
      
        default:
          break;
      }

      const data = {...userInfo,...profileInfo}

      res.status(httpCode.OK).json({
        status:httpCode.OK,
        message:"profile update successful",
        data
      })
      
  } catch (error) {
    next(error)
  }
}
