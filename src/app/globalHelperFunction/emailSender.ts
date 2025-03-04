import nodemailer from "nodemailer";
import env from "../env";

const emailSender = async (email:string,html:string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: env.emailSender.EMAIL,
      pass: env.emailSender.APP_PASSWORD,
    },
    tls:{
        rejectUnauthorized:false
    }
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"PH Health Care" <trcr719@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Reset password link - PH Health Care ✔", // Subject line
    // text: "Hello world?", // plain text body
    html, // html body
  });
};

export default emailSender
