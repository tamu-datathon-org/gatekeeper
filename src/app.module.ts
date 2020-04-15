import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MailController } from './mail/mail.controller';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';

@Module({
  imports: [],
  controllers: [AppController, MailController],
  providers: [AppService, MailService],
})
export class AppModule {}
