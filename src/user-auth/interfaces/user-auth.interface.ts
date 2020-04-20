export type UserAuthType = "EmailAndPassword" | "Google" | "Facebook";

export interface UserAuth {
  readonly email: string;
  readonly isVerified: boolean;
  readonly authType: UserAuthType;
  readonly passwordHash: string;
  readonly oAuthToken: string;
}
