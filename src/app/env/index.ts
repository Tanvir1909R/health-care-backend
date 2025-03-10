import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export default {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  jwt: {
    JWT_SECRET: process.env.JWT_SECRET,
    EXPIRE_IN: process.env.EXPIRE_IN,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRE_IN: process.env.REFRESH_TOKEN_EXPIRE_IN,
    RESET_PASSWORD_TOKEN: process.env.RESET_PASSWORD_TOKEN,
  },
  RESET_PASSWORD_LINK: process.env.RESET_PASSWORD_LINK,
  emailSender:{
    EMAIL:process.env.EMAIL,
    APP_PASSWORD: process.env.APP_PASSWORD,
  },
  ssl:{
    STORE_ID:process.env.STORE_ID,
    STORE_PASS:process.env.STORE_PASS,
    SUCCESS_URL:process.env.SUCCESS_URL,
    CANCEL_URL:process.env.CANCEL_URL,
    FAIL_URL:process.env.FAIL_URL,
    SSL_PAYMENT_API:process.env.SSL_PAYMENT_API,
    SSL_VALIDATION_API:process.env.SSL_VALIDATION_API,
  }
};
