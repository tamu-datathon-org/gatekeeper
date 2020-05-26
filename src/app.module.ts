import { Module } from "@nestjs/common";
import { EasyconfigModule } from "nestjs-easyconfig";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { UserAuthModule } from "./user-auth/user-auth.module";
import { MailModule } from "./mail/mail.module";
import { AppController } from "./app.controller";
import { SignupModule } from "./signup/signup.module";
import { UserModule } from "./user/user.module";
import { LoginModule } from "./login/login.module";
import { APP_FILTER } from "@nestjs/core";
import { GlobalHttpExceptionFilter } from "./common/filters/global-http-exception.filter";
import { EventModule } from './event/event.module';
import { AttendedEventModule } from './attended-event/attended-event.module';

@Module({
  imports: [
    AuthModule,
    UserAuthModule,
    EasyconfigModule.register({ safe: true }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    MailModule,
    SignupModule,
    UserModule,
    LoginModule,
    EventModule,
    AttendedEventModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter
    }
  ]
})
export class AppModule {}
