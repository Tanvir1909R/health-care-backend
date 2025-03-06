import express, { Application, Request, Response } from 'express';
import cors from 'cors'
import { userRoute } from './app/modules/User/user.route';
import { PrismaClient } from '@prisma/client';
import { adminRoute } from './app/modules/Admin/admin.route';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import httpStatus from 'http-status'
import { authRoute } from './app/modules/auth/auth.route';
import cookieParser from 'cookie-parser'
import { specialtiesRoute } from './app/modules/specialties/specialties.route';
import { doctorRoute } from './app/modules/doctor/doctor.route';
import { patientRoute } from './app/modules/patient/patient.route';
import { scheduleRoute } from './app/modules/schedule/schedule.route';
import { doctorScheduleRoute } from './app/modules/doctorSchedule/doctorSchedule.route';
export const prisma = new PrismaClient();
export const httpCode = httpStatus;

const app:Application = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.get('/',(req:Request,res:Response)=>{
    res.json({
        message:"welcome ph health care server"
    })
})

app.use('/api/v1/user', userRoute)
app.use('/api/v1/admin', adminRoute)
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/specialties', specialtiesRoute)
app.use('/api/v1/doctors', doctorRoute)
app.use('/api/v1/patients', patientRoute)
app.use('/api/v1/schedule', scheduleRoute)
app.use('/api/v1/doctor-schedule', doctorScheduleRoute)

// global error handler
app.use(globalErrorHandler)


// notfound route
app.use((req,res)=>{
    res.status(httpStatus.NOT_FOUND).json({
        success:false,
        message:"route not found"
    })
})


export default app