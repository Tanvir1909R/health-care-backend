import { Response } from "express"

type iJsonData<D> = {
    statusCode:number,
    success:boolean,
    message:string,
    data: D | null | undefined,
    meta?:{
        page:number,
        limit:number
    }
}


const sendResponse = <T>(res:Response,jsonData:iJsonData<T>)=>{
    res.status(jsonData.statusCode).json({
        success:jsonData.success,
        message:jsonData.message,
        data:jsonData.data || null || undefined, 
        meta:jsonData?.meta || null || undefined
    })
}

export default sendResponse