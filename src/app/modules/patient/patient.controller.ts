import { UserStatus } from "@prisma/client";
import { httpCode, prisma } from "../../../app";
import calculatePagination from "../../globalHelperFunction/calculatePagination";
import catchAsync from "../../globalHelperFunction/catchAsync";
import getFilterCondition from "../../globalHelperFunction/getFilterCondition";
import pick from "../../globalHelperFunction/pick";
import sendResponse from "../../globalHelperFunction/sendResponse";

export const getPatient = catchAsync(async (req, res) => {
  const andCondition = getFilterCondition(
    req.query,
    ["search", "name", "contactNumber", "designation", "registrationNumber","specialties"],
    ["name", "email", "address", "currentWorkingPlace"],
    true
  );

  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const { limit, skip, sortBy, sortOrder, page } = calculatePagination(options);

  const result = await prisma.doctor.findMany({
    where: andCondition,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include:{
      doctorSpecialties:{
        include:{
          specialties:true
        }
      }
    }
  });
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "doctor get successful",
    data: result,
    meta: {
      limit,
      page,
    },
  });
});
export const getOnePatient = catchAsync(async (req, res) => {
  const id = req.params.id;

  const result = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted:false
    },
  });
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "doctor get successful",
    data: result,
  });
});

export const updatePatient = catchAsync(async (req, res) => {
  const id = req.params.id;
  const { specialties, ...doctorData } = req.body;

  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });




    await prisma.$transaction(async (tc) => {
     await tc.doctor.update({
      where: {
        id,
      },
      data: doctorData,
      include: {
        doctorSpecialties: true,
      },
    });

    if(specialties && specialties.length > 0){
        //for delete
        const deleteIds = specialties.filter((specialty:{specialtyId:string, isDeleted:boolean}) => specialty.isDeleted)
        for(const deletedId of deleteIds){
            await tc.doctorSpecialties.deleteMany({
                where:{
                    doctorId:doctorInfo.id,
                    specialtiesId:deletedId.specialtyId
                }
            })
        }
        //for create
        const createSpIds = specialties.filter((specialty:{specialtyId:string, isDeleted:boolean}) => !specialty.isDeleted)
        for (const sp of createSpIds) {
            await tc.doctorSpecialties.create({
              data: {
                doctorId: doctorInfo.id,
                specialtiesId: sp.specialtyId,
              },
            });
          }
    }
  });

  const result = await prisma.doctor.findUnique({
    where:{
        id:doctorInfo.id
    },
    include:{
        doctorSpecialties:{
            include:{
                specialties:true
            }
        }
    }
  })

  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "doctor update successful",
    data: result,
  });
});

export const deletePatient = catchAsync(async (req, res) => {
  const id = req.params.id;

  const result = await prisma.doctor.delete({
    where: {
      id,
    },
  });
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "doctor delete successful",
    data: result,
  });
});
export const softDeletePatient = catchAsync(async (req, res) => {
  await prisma.doctor.findUniqueOrThrow({
    where: {
      id: req.params.id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (tc) => {
    const deletedDoctor = await tc.doctor.update({
      where: {
        id: req.params.id,
      },
      data: {
        isDeleted: true,
      },
    });
    await tc.user.update({
      where: {
        email: deletedDoctor.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return deletedDoctor;
  });
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "doctor delete successful",
    data: result,
  });
});
