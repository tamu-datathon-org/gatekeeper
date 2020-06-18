import { Injectable, ConflictException } from "@nestjs/common";
import { UserAuthService } from "../user-auth/user-auth.service";
import { SignupUserDto } from "./dto/signup-user.dto";
import { CreateUserAuthDto } from "../user-auth/dto/create-user-auth.dto";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";
import { MailService } from "../mail/mail.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { User } from "../user/interfaces/user.interface";

@Injectable()
export class SignupService {
  private readonly verificationPath = "/auth/signup/verify";
  constructor(
    private userAuthService: UserAuthService,
    private userService: UserService,
    private mailService: MailService,
    private readonly jwtService: JwtService
  ) {}

  private createOriginFromHost(host: string) {
    if (host.startsWith("https://") || host.startsWith("http://")) return host;
    let scheme = "https";
    if (host.startsWith("localhost")) {
      scheme = "http";
    }
    return `${scheme}://${host}`;
  }

  getVerificationUrl(email: string, host: string, redirectLink: string) {
    const userJwt = this.jwtService.sign(
      { email },
      {
        expiresIn: process.env.CONFIRMATION_JWT_EXPIRATION
      }
    );
    const confirmationLink = `${this.createOriginFromHost(host) ||
      process.env.DEFAULT_GATEKEEPER_ORIGIN}${
      this.verificationPath
    }/?user=${userJwt}&r=${redirectLink}`;
    return encodeURI(confirmationLink);
  }

  private async sendVerificationEmail(
    userEmail: string,
    host: string,
    redirectLink: string
  ): Promise<void> {
    return this.mailService.sendTemplatedEmail({
      emailTo: userEmail,
      subject: "Activate your account!",
      templateFile: "email-confirmation.ejs",
      templateParams: {
        confirmationLink: this.getVerificationUrl(userEmail, host, redirectLink)
      } /* TODO: Update when email-confirmation is implemented */
    });
  }

  /**
   * Uses UserAuthService to signup a user with the given email and password.
   * @param  {SignupUserDto} signupUserDto
   * @returns Promise
   */
  async signupUserEmailAndPassword(
    signupUserDto: SignupUserDto,
    host: string,
    redirectLink: string
  ): Promise<UserAuth> {
    const createUserPayload: CreateUserAuthDto = {
      email: signupUserDto.email,
      password: signupUserDto.password,
      authType: "EmailAndPassword",
      isVerified: false
    };
    const user = await this.userAuthService.create(createUserPayload);
    await this.sendVerificationEmail(user.email, host, redirectLink);
    return user;
  }

  async confirmUserSignup(userJwt: string): Promise<User> {
    const userPayload = this.jwtService.verify(userJwt); // Verify returns jwt payload and fails if JWT is invalid.

    // Make sure email exists and isn't already verified.
    const user = await this.userAuthService.findByEmail(userPayload.email);
    if (!user) throw new Error("Invalid user");
    if (user.isVerified)
      throw new ConflictException("User is already verified");

    user.isVerified = true;
    await user.save();

    return this.userService.create({
      userAuthId: user.id,
      firstName: user.firstName,
      lastName: user.lastName
    });
  }

  async resendVerificationEmail(
    userJwt: string,
    host: string,
    redirectLink: string
  ): Promise<string> {
    const { email } = this.jwtService.verify(userJwt); // Verify returns jwt payload and fails if JWT is invalid.

    // Make sure email exists and isn't already verified.
    const user = await this.userAuthService.findByEmail(email);
    if (!user) throw new Error("Invalid user");
    if (user.isVerified)
      throw new ConflictException("User is already verified");

    await this.sendVerificationEmail(email, host, redirectLink);
    return email;
  }
}
