import { httpCode, prisma } from "../../../app";
import catchAsync from "../../globalHelperFunction/catchAsync";
import sendResponse from "../../globalHelperFunction/sendResponse";

export const createDoctorSchedules = catchAsync(async (req, res) => {
  const user = req.user;
  const { schedulesIds } = req.body;
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const doctorScheduleData = schedulesIds.map(
    (scheduleId: string) => ({
      doctorId: doctorInfo.id,
      scheduleId,
    })
  );

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
