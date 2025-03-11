import { PaymentStatus } from "@prisma/client";
import { httpCode, prisma } from "../../../app";
import env from "../../env";
import ApiError from "../../errors/ApiError";
import catchAsync from "../../globalHelperFunction/catchAsync";
import sendResponse from "../../globalHelperFunction/sendResponse";
import axios from 'axios'
export const initPayment = catchAsync(async (req, res) => {
    const {appointmentId} = req.params;
    const paymentData = await prisma.payment.findFirstOrThrow({
      where:{
        appointmentId
      },
      include:{
        appointment:{
          include:{
            patient:true
          }
        }
      }
    })
    const data = {
        store_id :env.ssl.STORE_ID,
        store_passwd :env.ssl.STORE_PASS,
        total_amount: paymentData.amount,
        currency: 'BDT',
        tran_id: paymentData.transactionId,
        success_url: env.ssl.SUCCESS_URL,
        fail_url: env.ssl.FAIL_URL,
        cancel_url: env.ssl.CANCEL_URL,
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: paymentData.appointment.patient.name,
        cus_email: paymentData.appointment.patient.email,
        cus_add1: paymentData.appointment.patient.address,
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: paymentData.appointment.patient.contactNumber,
        cus_fax: '01711111111',
        ship_name: 'N/A',
        ship_add1: 'N/A',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const response = await axios ({
        method:"post",
        url: env.ssl.SSL_PAYMENT_API,
        data:data,
        headers: {"Content-Type":"application/x-www-form-urlencoded"}
    })
    
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "payment successful",
    data: {
      paymentUrl:response.data.GatewayPageURL
    },
  });
});


export const validatePayment = catchAsync(async(req,res)=>{
  const query = req.query;
  if(!query || query.status || !(query.status === 'VALID')){
    throw new ApiError(httpCode.BAD_REQUEST,'invalid payment')
  }

  const response = await axios({
    method:"GET",
    url:`${env.ssl.SSL_VALIDATION_API}?val_id=${query.val_id}&store_id=${env.ssl.STORE_ID}&store_passwd=${env.ssl.STORE_PASS}&format=json`
  })

  if(response.data.status !== 'VALID'){
    throw new ApiError(httpCode.BAD_REQUEST,'invalid payment')
  }

  await prisma.$transaction(async(tc)=>{
    const paymentUpdateData = await tc.payment.update({
      where:{
        transactionId: response.data.tran_id
      },
      data:{
        status:PaymentStatus.PAID,
        paymentGatewayData:response.data
      }
    })

    await tc.appointment.update({
      where:{
        id:paymentUpdateData.appointmentId
      },
      data:{
        paymentStatus:PaymentStatus.PAID
      }
    })

    return{
      message:"payment success"
    }
  })
})