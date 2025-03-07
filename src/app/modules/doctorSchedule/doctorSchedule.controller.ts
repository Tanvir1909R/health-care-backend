import { Prisma } from "@prisma/client";
import { httpCode, prisma } from "../../../app";
import catchAsync from "../../globalHelperFunction/catchAsync";
import pick from "../../globalHelperFunction/pick";
import sendResponse from "../../globalHelperFunction/sendResponse";
import calculatePagination from "../../globalHelperFunction/calculatePagination";
import ApiError from "../../errors/ApiError";
import getFilterCondition from "../../globalHelperFunction/getFilterCondition";

export const createDoctorSchedules = catchAsync(async (req, res) => {
  const user = req.user;
  const { schedulesIds } = req.body;
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const doctorScheduleData = schedulesIds.map((scheduleId: string) => ({
    doctorId: doctorInfo.id,
    scheduleId,
  }));

  const result = await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });

  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "schedule create successful",
    data: result,
  });
});

export const getMySchedules = catchAsync(async (req, res) => {
  const user = req.user;
  const { startDate, endDate, ...filterData } = pick(req.query, [
    "startDate",
    "endDate",
    "isBooked",
  ]);
  const andCondition = [];

  if (startDate && endDate) {
    andCondition.push({
      AND: [
        {
          schedule: {
            startDateTime: {
              gte: startDate as string,
            },
          },
        },
        {
          schedule: {
            endDateTime: {
              lte: endDate as string,
            },
          },
        },
      ],
    });
  }

  if (Object.keys(filterData).length > 0) {
    if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "true"
    ) {
      filterData.isBooked = true as any;
    } else if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "false"
    ) {
      filterData.isBooked = false as any;
    }
    andCondition.push({
      AND: Object.keys(filterData).map((field) => ({
        [field]: {
          equals: filterData[field],
        },
      })),
    });
  }

  const whereConditions: Prisma.DoctorSchedulesWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const { limit, skip, sortBy, sortOrder, page } = calculatePagination(options);
  const result = await prisma.doctorSchedules.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      schedule: true,
    },
  });
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "schedule get successful",
    meta: {
      page,
      limit,
    },
    data: result,
  });
});
export const deleteMySchedules = catchAsync(async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const isBookedSchedule = await prisma.doctorSchedules.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorInfo.id,
        scheduleId: id,
      },
      isBooked: true,
    },
  });

  if (isBookedSchedule) {
    throw new ApiError(
      httpCode.BAD_REQUEST,
      "can not delete the booked schedule"
    );
  }

  const result = await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorInfo.id,
        scheduleId: id,
      },
    },
  });
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "schedule delete successful",
    data: result,
  });
});

export const getAllSchedules = catchAsync(async (req, res) => {
  const { search, ...filterData } = pick(req.query,["search","isBooked","doctorId"]);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const { limit, page, skip,sortBy,sortOrder } = calculatePagination(options);
  const andConditions = [];

  if (search) {
    andConditions.push({
      doctor: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "true"
    ) {
      filterData.isBooked = true as any;
    } else if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "false"
    ) {
      filterData.isBooked = false as any;
    }
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: any =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.doctorSchedules.findMany({
    include: {
      doctor: true,
      schedule: true,
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy:{
      [sortBy]:sortOrder
    }
  });
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "schedule get successful",
    data: result,
    meta:{
      limit,
      page
    }
  });
});
