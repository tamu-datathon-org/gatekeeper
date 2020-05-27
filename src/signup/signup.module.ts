import { Module } from "@nestjs/common";
import { UserAuthModule } from "../user-auth/user-auth.module";
import { SignupController } from "./signup.controller";
import { SignupService } from "./signup.service";
import { MailModule } from "../mail/mail.module";
import { ValidatorService } from "../validator/validator.service";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [
    AuthModule,
    UserAuthModule,
    MailModule,
    UserModule,
    JwtModule.registerAsync({
      // Needs to be async as it uses env variable that's loaded after module is registered.
      useFactory: (): JwtModuleOptions => ({
        secret: process.env.AUTH_JWT_SECRET
      })
    })
  ],
  controllers: [SignupController],
  providers: [SignupService, ValidatorService],
  exports: [SignupService]
})
export class SignupModule {}
