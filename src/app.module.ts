import { Module } from '@nestjs/common';
import { EasyconfigModule } from  'nestjs-easyconfig';
import { AppController } from './app.controller';
import { MailController } from './mail/mail.controller';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';

@Module({
  imports: [EasyconfigModule.register({safe: true})],
  controllers: [AppController, MailController],
  providers: [AppService, MailService],
})
export class AppModule {}
