import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel, { UserDocument } from "../models/UserModel";

const jwtSecret = process.env.JWT_SECRET as string;

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export const auth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let decoded: { _id: string };

  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({ message: "Kindly sign in as a user" });
    }

    const token = authorization.replace("Bearer ", "");

    try {
      decoded = jwt.verify(token, jwtSecret) as { _id: string };
    } catch (jwtError) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await UserModel.findById(decoded._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin required." });
  }
  next();
};
