import { Module } from "@nestjs/common";
import { UserAuthModule } from "../user-auth/user-auth.module";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { LocalSerializer } from "./local.serializer";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { GoogleStrategy } from "./strategies/google.strategy";
import { FacebookStrategy } from "./strategies/facebook.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    UserAuthModule,
    PassportModule.register({ session: true, defaultStrategy: "local" }),
    JwtModule.registerAsync({
      // Needs to be async as it uses env variable that's loaded after module is registered.
      useFactory: (): JwtModuleOptions => ({
        secret: process.env.AUTH_JWT_SECRET
      })
    })
  ],
  providers: [
    AuthService,
    LocalStrategy,
    LocalSerializer,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy
  ],
  exports: [PassportModule, AuthService]
})
export class AuthModule {}
