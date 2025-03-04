import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../globalHelperFunction/catchAsync";
import { httpCode, prisma } from "../../../app";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, PrivateKey, Secret } from "jsonwebtoken";
import sendResponse from "../../globalHelperFunction/sendResponse";
import { UserStatus } from "@prisma/client";
import env from "../../env";
import ApiError from "../../errors/ApiError";
import emailSender from '../../globalHelperFunction/emailSender'

export const loginUser: RequestHandler = catchAsync(async (req, res) => {
  const data = req.body;
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: data.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword = await bcrypt.compare(
    data.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("password not match");
  }

  const accessToken = jwt.sign(
    {
      email: userData.email,
      role: userData.role,
    },
    env.jwt.JWT_SECRET as Secret,
    {
      algorithm: "HS256",
      expiresIn: "30d",
    }
  );
  const refreshToken = jwt.sign(
    {
      email: userData.email,
      role: userData.role,
    },
    env.jwt.REFRESH_TOKEN_SECRET as Secret,
    {
      algorithm: "HS256",
      expiresIn: "30d",
    }
  );

  res.cookie("PHrefreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
  });
  sendResponse(res, {
    success: true,
    message: "login successful",
    statusCode: httpCode.OK,
    data: {
      accessToken,
      needPasswordChange: userData.needPasswordChange,
    },
  });
});

export const refreshToken: RequestHandler = async (req, res) => {
  let decodedData: string | JwtPayload;
  const { PHrefreshToken } = req.cookies;
  try {
    decodedData = jwt.verify(
      PHrefreshToken,
      env.jwt.REFRESH_TOKEN_SECRET as Secret
    ) as JwtPayload;
  } catch (error) {
    throw new Error("you are not authorize");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwt.sign(
    {
      email: userData.email,
      role: userData.role,
    },
    env.jwt.JWT_SECRET as Secret,
    {
      algorithm: "HS256",
      expiresIn: "30d",
    }
  );

  sendResponse(res, {
    success: true,
    statusCode: httpCode.OK,
    message: "refresh-token received",
    data: {
      accessToken,
    },
  });
};
export const changePassword = async (
  req: Request & { user?: any },
  res: Response
) => {
  const user = req.user;
  const bodyData = req.body;
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!userData) {
    throw new Error("user not found");
  }

  const isCorrectPassword = await bcrypt.compare(
    bodyData.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("password not match");
  }

  const hashPassword = bcrypt.hashSync(bodyData.newPassword, 12);

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashPassword,
      needPasswordChange: false,
    },
  });

  sendResponse(res, {
    success: true,
    statusCode: httpCode.OK,
    message: "password change successful",
    data: null,
  });
};

export const forgetPassword: RequestHandler = catchAsync(async (req, res) => {
  const data = req.body;
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: data.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!userData) {
    throw new ApiError(httpCode.NOT_FOUND, "user not found");
  }
  const resetPassToken = jwt.sign(
    { email: userData.email, role: userData.role },
    env.jwt.RESET_PASSWORD_TOKEN as Secret,
    {
      algorithm: "HS256",
      expiresIn: "5m",
    }
  );
  const resetLink = `${env.RESET_PASSWORD_LINK}?email=${userData.email}&uid=${userData.id}&token=${resetPassToken}`;
  console.log(resetLink);
  await emailSender(userData.email,`
    
      <div>
        <a href="${resetLink}">
          <button>Reset link</button>
        </a>
      </div>
    `)
  
  sendResponse(res, {
    success: true,
    statusCode: httpCode.OK,
    message: "reset link sent",
    data: null,
  });
});

export const resetPassword:RequestHandler = catchAsync(async (req,res)=>{
  const token = req.headers.authorization || '';
  const data = req.body;
  const userData = await prisma.user.findUniqueOrThrow({
    where:{
      id:data.id,
      status:UserStatus.ACTIVE
    }
  })
  if (!userData) {
    throw new ApiError(httpCode.NOT_FOUND, "user not found");
  }
  const isValidToken = jwt.verify(token,env.jwt.RESET_PASSWORD_TOKEN as Secret)
  if (!isValidToken) {
    throw new ApiError(httpCode.FORBIDDEN, "Forbidden");
  }

  const hashPassword = bcrypt.hashSync(data.password, 12);
  await prisma.user.update({
    where:{
      id:data.id
    },
    data:{
      password:hashPassword
    }
  })
  sendResponse(res, {
    success: true,
    statusCode: httpCode.OK,
    message: "reset done",
    data: null,
  });
})
