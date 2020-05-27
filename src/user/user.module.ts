import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "./schemas/user.schema";
import { UserAuthModule } from "../user-auth/user-auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    UserAuthModule
  ],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
