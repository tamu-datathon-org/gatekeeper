import * as mongoose from "mongoose";

export const UserAuthSchema = new mongoose.Schema({
  email: String,
  isVerified: Boolean,
  authType: String, // "EmailAndPassword" | "Google" | "Facebook"
  passwordHash: String,
  firstName: String,
  lastName: String,
  accessId: String
});
