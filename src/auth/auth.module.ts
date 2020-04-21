import { Module } from "@nestjs/common";
import { UserAuthModule } from "../user-auth/user-auth.module";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { LocalSerializer } from "./local.serializer";

@Module({
  imports: [
    UserAuthModule,
    PassportModule.register({ session: true, defaultStrategy: "local" })
  ],
  providers: [AuthService, LocalStrategy, LocalSerializer],
  exports: [PassportModule]
})
export class AuthModule {}
