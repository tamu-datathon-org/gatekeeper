import * as mongoose from "mongoose";

export const AttendedEventSchema = new mongoose.Schema({
  userAuthId: String,
  eventId: String,
  timestamp: Date
});
