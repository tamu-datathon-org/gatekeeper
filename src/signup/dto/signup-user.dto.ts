import { IsEmail } from "class-validator";

export class SignupUserDto {
  @IsEmail()
  email: string;
  password: string;
}