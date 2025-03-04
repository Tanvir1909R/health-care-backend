import { httpCode, prisma } from "../../../app";
import calculatePagination from "../../globalHelperFunction/calculatePagination";
import catchAsync from "../../globalHelperFunction/catchAsync";
import getFilterCondition from "../../globalHelperFunction/getFilterCondition";
import pick from "../../globalHelperFunction/pick";
import sendResponse from "../../globalHelperFunction/sendResponse";

export const getDoctors = catchAsync(async(req,res)=>{
    const andCondition = getFilterCondition(req.query,['search','name','contactNumber','designation','registrationNumber'],['name','email','address','currentWorkingPlace'],true);

    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const { limit, skip, sortBy, sortOrder, page } = calculatePagination(options);

    const result = await prisma.doctor.findMany({
        where:andCondition,
        skip,
        take:limit,
        orderBy:{
            [sortBy]: sortOrder,
        }
    });
    sendResponse(res,{
        statusCode:httpCode.OK,
        success:true,
        message:"doctor get successful",
        data:result
    })
})