import { Module } from "@nestjs/common";
import { UserAuthModule } from "../user-auth/user-auth.module";
import { SignupController } from "./signup.controller";
import { SignupService } from "./signup.service";
import { MailModule } from "../mail/mail.module";
import { AuthModule } from "../auth/auth.module";
import { ValidatorService } from "../validator/validator.service";

@Module({
  imports: [UserAuthModule, MailModule, AuthModule],
  controllers: [SignupController],
  providers: [SignupService, ValidatorService],
  exports: [SignupService]
})
export class SignupModule {}
