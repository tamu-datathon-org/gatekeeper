import { Document } from "mongoose";

export type UserAuthType = "EmailAndPassword" | "Google" | "Facebook";

export interface UserAuth extends Document {
  readonly email: string;
  readonly notificationEmail: string;
  readonly isVerified: boolean;
  readonly authType: UserAuthType;
  readonly passwordHash?: string;
  readonly oAuthToken?: string;
}
