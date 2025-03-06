import { addHours, addMinutes, format } from "date-fns";
import { httpCode, prisma } from "../../../app";
import catchAsync from "../../globalHelperFunction/catchAsync";
import sendResponse from "../../globalHelperFunction/sendResponse";

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
