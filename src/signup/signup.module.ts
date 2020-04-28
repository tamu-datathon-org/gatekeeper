import { Module } from "@nestjs/common";
import { UserAuthModule } from "../user-auth/user-auth.module";
import { SignupController } from "./signup.controller";
import { SignupService } from "./signup.service";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [UserAuthModule, MailModule],
  controllers: [SignupController],
  providers: [SignupService],
  exports: [SignupService]
})
export class SignupModule {}
