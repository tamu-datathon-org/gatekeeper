import { Document } from "mongoose";

export type OAuthProviders = "Google" | "Facebook";
export type UserAuthType = "EmailAndPassword" | OAuthProviders;

export interface UserAuth extends Document {
  readonly email: string;
  isVerified: boolean;
  readonly authType: UserAuthType;
  readonly passwordHash?: string;
}
