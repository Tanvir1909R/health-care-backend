import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { httpCode } from "../../app";
import ApiError from "../errors/ApiError";
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode;
  let success = false;
  let message = "Something went wrong!";
  let error = err;

  if (err instanceof PrismaClientValidationError) {
    statusCode = httpCode.INTERNAL_SERVER_ERROR
    success = false
    message = "validation error"
    error = err.message
  }else if(err instanceof PrismaClientKnownRequestError){
    if(err.code === "P2002"){
      statusCode = httpCode.BAD_REQUEST;
      message = "Duplicate field error",
      error = err.meta
    }
  }else if(err instanceof ApiError){
    if(err.message === "Incorrect password"){
      statusCode = err.statusCode;
      message = err.message
    }
    
  }
  res.status(statusCode ? statusCode : 500).json({
    success,
    message,
    error
  });
};

export default globalErrorHandler;
