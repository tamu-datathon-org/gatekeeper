import { Document } from "mongoose";

export interface User extends Document {
  readonly authId: string;
  readonly email: string;
  readonly notificationEmail: string;
  readonly name?: string;
  readonly resumeLink?: string;
  readonly birthYear?: number; // for age calculation
  readonly locationCity?: string;
  readonly locationState?: string;
  readonly locationCountry?: string;
  readonly isFirstGenerationCollegeStudent?: boolean;
}
