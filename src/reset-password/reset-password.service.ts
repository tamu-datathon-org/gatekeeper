import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthLinkGeneratorService } from 'src/auth/auth-link-generator.service';
import { MailService } from 'src/mail/mail.service';
import { UserAuthService } from 'src/user-auth/user-auth.service';
import { AuthProviderException } from 'src/auth/exceptions/auth-provider.exception';

@Injectable()
export class ResetPasswordService {
  private readonly resetPasswordPath = "/auth/reset-password/reset";
  constructor(
    private userAuthService: UserAuthService,
    private mailService: MailService,
    private readonly jwtService: JwtService,
    private authLinkGeneratorService: AuthLinkGeneratorService
  ) {}
   
  private async sendResetPasswordEmail(
    userEmail: string,
    host: string,
    redirectLink: string
  ): Promise<void> {
    return this.mailService.sendTemplatedEmail({
      emailTo: userEmail,
      subject: "Reset your password",
      templateFile: "reset-password.ejs",
      templateParams: {
        resetPasswordLink: this.authLinkGeneratorService.getLinkWithUserJwt(userEmail, host, this.resetPasswordPath, redirectLink)
      }
    });
  }

  async sendResetPasswordEmailForUser(
    email: string,
    host: string,
    redirectLink: string
  ) {
    const user = await this.userAuthService.findByEmail(email);
    if (!user)
      throw new NotFoundException("A user with the given email does not exist.");
    if (user.authType !== "EmailAndPassword")
      throw new AuthProviderException(user.authType, 401);
    return this.sendResetPasswordEmail(email, host, redirectLink);
  }
}
