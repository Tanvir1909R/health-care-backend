import { AppointmentStatus, PaymentStatus, Prisma } from "@prisma/client";
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


export const getReviews = catchAsync(async(req,res)=>{
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const { limit, page, skip,sortBy,sortOrder } = calculatePagination(options);
    const { patientEmail, doctorEmail } = pick(req.params,["patientEmail","doctorEmail"]);
    const andConditions = [];

    if (patientEmail) {
        andConditions.push({
            patient: {
                email: patientEmail
            }
        })
    }

    if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail
            }
        })
    }

    const whereConditions: Prisma.ReviewWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.review.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:{
          [sortBy]:sortOrder
        }, 
        include: {
            doctor: true,
            patient: true,
            //appointment: true,
        },
    });
    const total = await prisma.review.count({
        where: whereConditions,
    });

    sendResponse(res, {
      success: true,
      message: "review get successful",
      statusCode: httpCode.OK,
      data:result,
      meta: {
        page,
        limit,
    }
    });
})
