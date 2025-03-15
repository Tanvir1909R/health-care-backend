import {
  AppointmentStatus,
  PaymentStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
import { httpCode, prisma } from "../../../app";
import catchAsync from "../../globalHelperFunction/catchAsync";
import sendResponse from "../../globalHelperFunction/sendResponse";
import { iUser } from "../../../types";



const getBarChartData = async () => {
  const appointmentCountByMonth = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
          CAST(COUNT(*) AS INTEGER) AS count
    FROM "appointment"
    GROUP BY month
    ORDER BY month ASC;
  `;

  return appointmentCountByMonth;
};
const getPiChartData = async () => {
  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map((count) => ({
      status: count.status,
      count: +count._count.id,
    }));

  return formattedAppointmentStatusDistribution;
};

const getAdminMetaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: PaymentStatus.PAID,
    },
  });

  const barChartData = await getBarChartData();
  const barPiData = await getPiChartData();

  return {
    appointmentCount,
    patientCount,
    doctorCount,
    paymentCount,
    totalRevenue,
    barChartData,
    barPiData
  };
};

const getSuperAdminMetaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const adminCount = await prisma.admin.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: PaymentStatus.PAID,
    },
  });

  const barChartData = await getBarChartData();
  const barPiData = await getPiChartData();
  return {
    appointmentCount,
    patientCount,
    doctorCount,
    paymentCount,
    totalRevenue,
    adminCount,
    barChartData,
    barPiData
  };
};

const getDoctorMetaData = async (user: iUser) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: doctorData.id,
    },
  });

  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    _count: {
      id: true,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      doctorId: doctorData.id,
    },
  });

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      appointment: {
        doctorId: doctorData.id,
      },
      status: PaymentStatus.PAID,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: {
      doctorId: doctorData.id,
    },
  });

  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map((count) => ({
      status: count.status,
      count: +count._count.id,
    }));

  return {
    appointmentCount,
    reviewCount,
    patientCount: patientCount.length,
    totalRevenue,
    formattedAppointmentStatusDistribution,
  };
};

const getPatientMetaData = async (user: iUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      patientId: patientData.id,
    },
  });

  const prescriptionCount = await prisma.prescription.count({
    where: {
      patientId: patientData.id,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      patientId: patientData.id,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: {
      patientId: patientData.id,
    },
  });

  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map((count) => ({
      status: count.status,
      count: +count._count.id,
    }));
  console.log("patient");

  return {
    appointmentCount,
    reviewCount,
    prescriptionCount,
    formattedAppointmentStatusDistribution,
  };
};

export const fetchDashboardMetaData = catchAsync(async (req, res) => {
  const user = req.user;

  let metaData;

  switch (user?.role) {
    case UserRole.ADMIN:
      metaData = await getAdminMetaData();
      break;
    case UserRole.DOCTOR:
      metaData = await getDoctorMetaData(user);
      break;
    case UserRole.PATIENT:
      metaData = await getPatientMetaData(user);
      break;
    case UserRole.SUPER_ADMIN:
      metaData = await getSuperAdminMetaData();
      break;
    default:
      break;
  }

  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "meta data get successful",
    data: metaData,
  });
});
