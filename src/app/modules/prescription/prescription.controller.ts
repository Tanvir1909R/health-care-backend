import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { httpCode, prisma } from "../../../app";
import catchAsync from "../../globalHelperFunction/catchAsync";
import sendResponse from "../../globalHelperFunction/sendResponse";
import ApiError from "../../errors/ApiError";
import pick from "../../globalHelperFunction/pick";
import calculatePagination from "../../globalHelperFunction/calculatePagination";

export const createPrescription = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });

  if (!(user?.email === appointmentData.doctor.email)) {
    throw new ApiError(httpCode.BAD_REQUEST, "This is not your appointment!");
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate || null || undefined,
    },
  });

  sendResponse(res, {
    success: true,
    message: "prescription create successful",
    statusCode: httpCode.OK,
    data:result,
  });
});
export const myPrescription = catchAsync(async (req, res) => {
  const user = req.user;
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const { limit, page, skip,sortBy,sortOrder } = calculatePagination(options);
  const result = await prisma.prescription.findMany({
    where: {
      patient: {
        email: user?.email
      }
    },
    skip,
    take:limit,
    orderBy:{
        [sortBy]:sortOrder
    },
    include:{
        doctor:true,
        patient:true,
        appointment:true
    }
  });

  sendResponse(res, {
    success: true,
    message: "prescription get successful",
    statusCode: httpCode.OK,
    data:result,
    meta:{
        page,
        limit
    }
  });
});
