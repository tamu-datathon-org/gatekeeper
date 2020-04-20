import { UserAuthType } from "../interfaces/user-auth.interface";

export class CreateUserAuthDto {
  email: string;
  isVerified: boolean;
  authType: UserAuthType;
  password?: string;
  oAuthToken?: string;
}
