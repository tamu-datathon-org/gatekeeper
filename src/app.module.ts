import { Module } from "@nestjs/common";
import { EasyconfigModule } from "nestjs-easyconfig";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { UserAuthModule } from "./user-auth/user-auth.module";
import { AppController } from "./app.controller";
@Module({
  imports: [
    AuthModule,
    UserAuthModule,
    EasyconfigModule.register({ safe: true }),
    MongooseModule.forRoot(process.env.MONGODB_URL)
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
