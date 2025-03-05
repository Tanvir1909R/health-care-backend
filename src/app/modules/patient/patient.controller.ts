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
    ["search", "name", "email", "address"],
    ["name", "email", "address"],
    true
  );

  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const { limit, skip, sortBy, sortOrder, page } = calculatePagination(options);

  const result = await prisma.patient.findMany({
    where: andCondition,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    }
  });
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "patient get successful",
    data: result,
    meta: {
      limit,
      page,
    },
  });
});
export const getOnePatient = catchAsync(async (req, res) => {
  const id = req.params.id;

  const result = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted:false
    },
  });
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "patient get successful",
    data: result,
  });
});

export const updatePatient = catchAsync(async (req, res) => {
  const {patientHealthData,medicalReport,...patientData} = req.body;
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where:{
        id:req.params.id
    }
  })

  await prisma.$transaction(async(tc)=>{
    await tc.patient.update({
        where:{
            id:req.params.id
        },
        data: patientData
    })

    if(patientHealthData){
      await tc.patientHealthData.upsert({
        where:{
          patientId:patientInfo.id
        },
        update:patientHealthData,
        create: {...patientHealthData, patientId:patientInfo.id}
      })
    }
    if (medicalReport) {
      await tc.medicalReport.create({
        data: { ...medicalReport, patientId: patientInfo.id }
      })
    }
  })

  const result = await prisma.patient.findUnique({
    where: {
      id: patientInfo.id
    },
    include: {
      patientHealthData: true,
      medicalReport: true
    }
  })

  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "patient update successful",
    data:result,
  });
});

export const deletePatient = catchAsync(async (req, res) => {
  const id = req.params.id;

  const result = await prisma.$transaction(async(tc)=>{
    await tc.medicalReport.deleteMany({
      where:{
        patientId:id
      }
    })

    await tc.patientHealthData.delete({
      where:{
        patientId:id
      }
    })

    const deleteData = await tc.patient.delete({
      where:{
        id
      }
    })

    await tc.user.delete({
      where:{
        email: deleteData.email
      }
    })
    return deleteData
  })
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "patient delete successful",
    data: result,
  });
});

export const softDeletePatient = catchAsync(async (req, res) => {
  await prisma.patient.findUniqueOrThrow({
    where: {
      id: req.params.id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (tc) => {
    const deletedPatient = await tc.patient.update({
      where: {
        id: req.params.id,
      },
      data: {
        isDeleted: true,
      },
    });
    await tc.user.update({
      where: {
        email: deletedPatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return deletedPatient;
  });
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "patient delete successful",
    data: result,
  });
});
