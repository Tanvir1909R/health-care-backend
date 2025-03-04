import { RequestHandler } from "express";
import catchAsync from "../../globalHelperFunction/catchAsync";
import { uploadCloudinary } from "../../globalHelperFunction/fileUpload";
import { httpCode, prisma } from "../../../app";
import sendResponse from "../../globalHelperFunction/sendResponse";

export const createSpecialties:RequestHandler = catchAsync(async(req,res)=>{
    const file = req.file;
    if(file){
        const uploadData:any = await uploadCloudinary(file);
        req.body.icon = uploadData?.secure_url;
    }

    const result = await prisma.specialties.create({
        data:req.body
    })

    sendResponse(res,{
        success:true,
        message:"specialties create successful",
        statusCode:httpCode.OK,
        data:result
    })
})
export const getSpecialties:RequestHandler = catchAsync(async(req,res)=>{

    const result = await prisma.specialties.findMany()

    sendResponse(res,{
        success:true,
        message:"specialties get successful",
        statusCode:httpCode.OK,
        data:result
    })
})
export const deleteSpecialties:RequestHandler = catchAsync(async(req,res)=>{
    const id = req.params.id
    const result = await prisma.specialties.delete({
        where:{
            id
        }
    })

    sendResponse(res,{
        success:true,
        message:"specialties delete successful",
        statusCode:httpCode.OK,
        data:result
    })
})