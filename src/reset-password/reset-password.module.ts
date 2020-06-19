import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { ResetPasswordController } from "./reset-password.controller";
import { ResetPasswordService } from "./reset-password.service";
import { UserAuthModule } from "../user-auth/user-auth.module";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [
    AuthModule,
    UserAuthModule,
    MailModule,
    JwtModule.registerAsync({
      // Needs to be async as it uses env variable that's loaded after module is registered.
      useFactory: (): JwtModuleOptions => ({
        secret: process.env.AUTH_JWT_SECRET
      })
    })
  ],
  controllers: [ResetPasswordController],
  providers: [ResetPasswordService]
})
export class ResetPasswordModule {}
