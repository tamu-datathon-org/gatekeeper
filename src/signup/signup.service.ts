import { Injectable } from "@nestjs/common";
import { UserAuthService } from "../user-auth/user-auth.service";
import { SignupUserDto } from "./dto/signup-user.dto";
import { CreateUserAuthDto } from "..//user-auth/dto/create-user-auth.dto";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";
import { MailService } from "../mail/mail.service";

@Injectable()
export class SignupService {
  constructor(
    private userAuthService: UserAuthService,
    private mailService: MailService
  ) {}

  /**
   * Uses UserAuthService to signup a user with the given email and password.
   * @param  {SignupUserDto} signupUserDto
   * @returns Promise
   */
  async signupUserEmailAndPassword(
    signupUserDto: SignupUserDto
  ): Promise<UserAuth> {
    const createUserPayload: CreateUserAuthDto = {
      email: signupUserDto.email,
      password: signupUserDto.password,
      authType: "EmailAndPassword",
      isVerified: false
    };
    const user = await this.userAuthService.create(createUserPayload);

    await this.mailService.sendTemplatedEmail({
      emailTo: user.email,
      subject: "Activate your account!",
      templateFile: "email-confirmation.ejs",
      templateParams: {} /* TODO: Update when email-confirmation is implemented */
    });
    return user;
  }
}
