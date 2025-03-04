import { JwtPayload } from "jsonwebtoken";
import {Request} from 'express'

interface iUser extends JwtPayload {
  email: string;
  role: string;
}
declare global {
  namespace Express {
    interface Request {
      user?: iUser;
    }
  }
}
