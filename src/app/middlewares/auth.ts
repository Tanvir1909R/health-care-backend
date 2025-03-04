import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload, Secret } from 'jsonwebtoken'
import env from "../env";
import ApiError from "../errors/ApiError";
import { httpCode } from "../../app";
import { iUser } from "../../types";

const auth = (...roles:string[]) => async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const token = req.headers.authorization;
        if(!token){
            throw new ApiError(httpCode.UNAUTHORIZED,'you are not authorize!')
        }
        const verifyUser = jwt.verify(token,env.jwt.JWT_SECRET as Secret) as iUser

        if(typeof verifyUser === 'string'){
            throw new ApiError(httpCode.FORBIDDEN,'Forbidden!')
        }

        if(roles.length && !roles.includes(verifyUser.role)){
            throw new ApiError(httpCode.FORBIDDEN,'Forbidden!')
        }
        req.user = verifyUser
        next()
    } catch (error) {
        next(error)
    }
}

export default auth