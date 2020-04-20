import { UserAuthType } from "../interfaces/user-auth.interface";

export class CreateUserAuthDto {
  readonly email: string;
  readonly authType: UserAuthType;
}