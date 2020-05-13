import { Module } from "@nestjs/common";
import { UserAuthModule } from "../user-auth/user-auth.module";
import { SignupController } from "./signup.controller";
import { SignupService } from "./signup.service";
import { MailModule } from "../mail/mail.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [UserAuthModule, MailModule, AuthModule],
  controllers: [SignupController],
  providers: [SignupService],
  exports: [SignupService]
})
export class SignupModule {}
