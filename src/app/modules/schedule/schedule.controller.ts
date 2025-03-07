import { addHours, addMinutes, format } from "date-fns";
import { httpCode, prisma } from "../../../app";
import catchAsync from "../../globalHelperFunction/catchAsync";
import sendResponse from "../../globalHelperFunction/sendResponse";
import getFilterCondition from "../../globalHelperFunction/getFilterCondition";
import pick from "../../globalHelperFunction/pick";
import calculatePagination from "../../globalHelperFunction/calculatePagination";
import { Prisma } from "@prisma/client";

export const createSchedules = catchAsync(async (req, res) => {
  const { startDate, endDate, startTime, endTime } = req.body;
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  const intervalTime = 30;
  const schedules = [];
  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );
    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );

    while (startDateTime < endDateTime) {
      const scheduleData = {
        startDateTime: startDateTime,
        endDateTime: addMinutes(startDateTime, intervalTime),
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });
      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }
      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "schedule create successful",
    data: schedules,
  });
});

export const getSchedules = catchAsync(async (req, res) => {
  const user = req.user
  const { startDate, endDate, ...filterData } = pick(req.query,["startDate","endDate"]);
  const andCondition = [];

  if (startDate && endDate) {
    andCondition.push({
      AND:[
        {
          startDateTime:{
            gte:startDate as string
          }
        },
        {
          endDateTime:{
            lte: endDate as string
          }
        }
      ]
    });
  }


  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((field) => ({
        [field]: {
          equals: filterData[field],
        },
      })),
    });
  }

  const whereConditions: Prisma.ScheduleWhereInput =
  andCondition.length > 0 ? { AND: andCondition } : {};

  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where:{
      doctor:{
        email:user?.email
      }
    }
  })

  const doctorSchedulesIds = doctorSchedules.map((schedule)=> schedule.scheduleId)
  
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const { limit, skip, sortBy, sortOrder, page } = calculatePagination(options);
  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id:{
        notIn:doctorSchedulesIds
      }
    },
    skip,
    take:limit,
    orderBy:{
      [sortBy]:sortOrder
    }
  });
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "schedule get successful",
    meta:{
      page,
      limit
    },
    data: result,
  });
});
