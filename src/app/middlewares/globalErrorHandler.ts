import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { httpCode } from "../../app";
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = "Something went wrong!";
  let error = err;

  if (err instanceof PrismaClientValidationError) {
    statusCode = httpCode.INTERNAL_SERVER_ERROR
    success = false
    message = "validation error"
    error = err.message
  }
  if(err instanceof PrismaClientKnownRequestError){
    if(err.code === "P2002"){
      message = "Duplicate field error",
      error = err.meta
    }
  }
  res.status(statusCode).json({
    success,
    message,
    error
  });
};

export default globalErrorHandler;
