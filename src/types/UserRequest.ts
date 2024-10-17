import { Request } from "express";
import { UserDocument } from "../models/UserModel";
// Import the updated UserDocument

interface AdminRequest extends Request {
  user?: UserDocument; // Use the UserDocument type
}

export default AdminRequest;
