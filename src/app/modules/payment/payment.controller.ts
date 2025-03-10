import { httpCode } from "../../../app";
import catchAsync from "../../globalHelperFunction/catchAsync";
import sendResponse from "../../globalHelperFunction/sendResponse";
import axios from 'axios'
export const initPayment = catchAsync(async (req, res) => {

    const data = {
        store_id :"boost67cb51937627f",
        store_passwd :"boost67cb51937627f@ssl",
        total_amount: 100,
        currency: 'BDT',
        tran_id: 'REF123', // use unique tran_id for each api call
        success_url: 'http://localhost:3030/success',
        fail_url: 'http://localhost:3030/fail',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const response = await axios ({
        method:"post",
        url: "https://sandbox.sslcommerz.com/gwprocess/v3/api.php",
        data:data,
        headers: {"Content-Type":"application/x-www-form-urlencoded"}
    })

    console.log(response.data);
    
  sendResponse(res, {
    statusCode: httpCode.OK,
    success: true,
    message: "patient delete successful",
    data: [],
  });
});
