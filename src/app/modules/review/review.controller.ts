import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { httpCode, prisma } from "../../../app";
import catchAsync from "../../globalHelperFunction/catchAsync";
import sendResponse from "../../globalHelperFunction/sendResponse";
import ApiError from "../../errors/ApiError";
import pick from "../../globalHelperFunction/pick";
import calculatePagination from "../../globalHelperFunction/calculatePagination";

export const createReview = catchAsync(async (req, res) => {
  const payload = req.body
  const user = req.user

  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email
    }
  });
  
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId
    }
  });

  if(!(patientData.id === appointmentData.patientId)) {
    throw new ApiError(httpCode.BAD_REQUEST, "This is not your appointment!");
  }

  const result = await prisma.$transaction(async(tx)=>{
    const result = await tx.review.create({
      data: {
        appointmentId: appointmentData.id,
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
        rating: payload.rating,
        comment: payload.comment
      }
    });
    const averageRating = await tx.review.aggregate({
      _avg: {
        rating: true
      }
    });

    await tx.doctor.update({
      where: {
        id: result.doctorId
      },
      data: {
        averageRating: averageRating._avg.rating as number
      }
    });

    return result
  })
  sendResponse(res, {
    success: true,
    message: "review create successful",
    statusCode: httpCode.OK,
    data:result
  });
});
