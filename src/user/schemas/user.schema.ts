import * as mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
  authId: String,
  email: String,
  notificationEmail: String,
  name: String,
  resumeLink: String,
  birthYear: Number, // for age calculation
  locationCity: String,
  locationState: String,
  locationCountry: String,
  isFirstGenerationCollegeStudent: Boolean
});
