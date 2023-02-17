import { Document } from "mongoose";

export type OAuthProviders = "Google" | "Facebook";
export type UserAuthType = "EmailAndPassword" | OAuthProviders;

export interface UserAuth extends Document {
  readonly email: string;
  isVerified: boolean;
  readonly authType: UserAuthType;
  passwordHash?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  accessId?: string;
}
