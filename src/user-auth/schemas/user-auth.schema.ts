import * as mongoose from "mongoose";

export const UserAuthSchema = new mongoose.Schema({
  email: String,
  notificationEmail: String,
  isVerified: Boolean,
  authType: String, // "EmailAndPassword" | "Google" | "Facebook"
  passwordHash: String,
  oAuthToken: String
});
