import { Prisma, UserRole } from "@prisma/client";
import { httpCode, prisma } from "../../../app";
import calculatePagination from "../../globalHelperFunction/calculatePagination";
import catchAsync from "../../globalHelperFunction/catchAsync";
import pick from "../../globalHelperFunction/pick";
import sendResponse from "../../globalHelperFunction/sendResponse";
import { v4 as uuid } from "uuid";
import { userRoute } from "../User/user.route";

export const createAppointment = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user!.email,
    },
  });

  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorInfo.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });
  const videoCallingId = uuid();

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientInfo.id,
        doctorId: doctorInfo.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });
    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorInfo.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: appointmentData.id,
      },
    });
    const transactionId = `PH-health-${uuid()}`;
    console.log(transactionId);

    await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorInfo.appointmentFee,
        transactionId,
      },
    });
    return appointmentData;
  });
  sendResponse(res, {
    success: true,
    message: "specialties delete successful",
    statusCode: httpCode.OK,
    data: result,
  });
});

export const getMyAppointment = catchAsync(async (req, res) => {
  const user = req.user;
  const { ...filterData } = pick(req.query, ["status", "paymentStatus"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const { limit, skip, sortBy, sortOrder, page } = calculatePagination(options);
  const andConditions = [];

  if (user?.role === UserRole.PATIENT) {
    andConditions.push({
      patient: {
        email: user?.email,
      },
    });
  } else if (user?.role === UserRole.DOCTOR) {
    andConditions.push({
      doctor: {
        email: user?.email,
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.appointment.findMany({
    include:
      user?.role === UserRole.PATIENT
        ? { doctor: true, schedule: true }
        : {
            patient: {
              include: { medicalReport: true, patientHealthData: true },
            },
            schedule: true,
          },
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  sendResponse(res, {
    success: true,
    message: "appointment get successful",
    statusCode: httpCode.OK,
    data: result,
    meta: {
      limit,
      page,
    },
  });
});
