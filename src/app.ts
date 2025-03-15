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
import { appointmentRoute } from './app/modules/appointment/appointment.route';
import { paymentRoute } from './app/modules/payment/payment.route';
import { cancelUnpaidAppointment } from './app/modules/appointment/appointment.controller';
import cron from 'node-cron'
import { prescriptionRoute } from './app/modules/prescription/prescription.route';
import { reviewRoute } from './app/modules/review/review.route';
import { metaRoute } from './app/modules/meta/meta.route';
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

cron.schedule('* * * * *', () => {
    cancelUnpaidAppointment()
});

app.use('/api/v1/user', userRoute)
app.use('/api/v1/admin', adminRoute)
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/specialties', specialtiesRoute)
app.use('/api/v1/doctors', doctorRoute)
app.use('/api/v1/patients', patientRoute)
app.use('/api/v1/schedule', scheduleRoute)
app.use('/api/v1/doctor-schedule', doctorScheduleRoute)
app.use('/api/v1/appointment', appointmentRoute)
app.use('/api/v1/payment', paymentRoute)
app.use('/api/v1/prescription', prescriptionRoute)
app.use('/api/v1/review', reviewRoute)
app.use('/api/v1/meta', metaRoute)

// global error handler
app.use(globalErrorHandler)


// notfound route
app.use((req,res)=>{
    res.status(httpStatus.NOT_FOUND).json({
        success:false,
        message:"route not found"
    })
})

const prismaa = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  })
  
  prismaa.$on('query', (e) => {
    console.log('Query: ' + e.query)
    console.log('Params: ' + e.params)
    console.log('Duration: ' + e.duration + 'ms')
  })


export default app