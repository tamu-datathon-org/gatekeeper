import { Document } from "mongoose";

export interface AttendedEvent extends Document {
  readonly userAuthId: string;
  readonly eventId: string;
}
