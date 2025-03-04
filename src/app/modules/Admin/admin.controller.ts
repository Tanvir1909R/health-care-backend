import { RequestHandler } from "express";
import { prisma } from "../../../app";
import pick from "../../globalHelperFunction/pick";
import getFilterCondition from "../../globalHelperFunction/getFilterCondition";
import calculatePagination from "../../globalHelperFunction/calculatePagination";
import { Admin, UserStatus } from "@prisma/client";
import sendResponse from "../../globalHelperFunction/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../globalHelperFunction/catchAsync";

export const getAdmin: RequestHandler = catchAsync(async (req, res) => {
  const andCondition = getFilterCondition(
    req.query,
    ["search", "name", "email", "contactNumber"],
    ["name", "email", "contactNumber"],
    true
  );
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const { limit, skip, sortBy, sortOrder, page } = calculatePagination(options);

  const result = await prisma.admin.findMany({
    where: andCondition,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });
  sendResponse<Admin[]>(res, {
    statusCode: httpStatus.OK,
    message: "admin get success",
    success: true,
    data: result,
    meta: {
      page,
      limit,
    },
  });
});
export const getSingleAdmin: RequestHandler = catchAsync(async (req, res) => {
  const result = await prisma.admin.findUnique({
    where: {
      id: req.params.id,
      isDeleted: false,
    },
  });
  sendResponse<Admin>(res, {
    statusCode: httpStatus.OK,
    message: "admin get success",
    success: true,
    data: result,
  });
});
export const updateAdmin: RequestHandler = catchAsync(async (req, res) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id: req.params.id,
      isDeleted: false,
    },
  });
  const result = await prisma.admin.update({
    where: {
      id: req.params.id,
    },
    data: req.body,
  });
  sendResponse<Admin>(res, {
    statusCode: httpStatus.OK,
    message: "admin update success",
    success: true,
    data: result,
  });
});
export const deleteAdmin: RequestHandler = catchAsync(async (req, res) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id: req.params.id,
    },
  });

  const result = await prisma.$transaction(async (tc) => {
    const deletedAdmin = await tc.admin.delete({
      where: {
        id: req.params.id,
      },
    });
    await tc.user.delete({
      where: {
        email: deletedAdmin.email,
      },
    });
    return deletedAdmin;
  });
  sendResponse<Admin>(res, {
    statusCode: httpStatus.OK,
    message: "admin delete success",
    success: true,
    data: result,
  });
});
export const softDeleteAdmin: RequestHandler = catchAsync(async (req, res) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id: req.params.id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (tc) => {
    const deletedAdmin = await tc.admin.update({
      where: {
        id: req.params.id,
      },
      data: {
        isDeleted: true,
      },
    });
    await tc.user.update({
      where: {
        email: deletedAdmin.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return deletedAdmin;
  });
  sendResponse<Admin>(res, {
    statusCode: httpStatus.OK,
    message: "admin delete success",
    success: true,
    data: result,
  });
});
