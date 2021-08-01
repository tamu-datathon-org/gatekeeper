import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailCoreService } from "./mail-core.service";

@Module({
  providers: [MailService, MailCoreService],
  exports: [MailService],
})
export class MailModule {}
