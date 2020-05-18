import { Injectable, NotFoundException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { AuthService } from "../auth.service";
import { UserAuthService } from "../../user-auth/user-auth.service";

// Nest.js does not have good docs on OAuth2 authentication.
// For reference: https://medium.com/@nielsmeima/auth-in-nest-js-and-angular-463525b6e071

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "Google") {
  constructor(
    private authService: AuthService,
    private userAuthService: UserAuthService
  ) {
    // http://www.passportjs.org/docs/google/
    super({
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/login/google/callback",
      passReqToCallback: true,
      scope: ["profile", "email"]
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile,
    done: (err: any, id?: any) => void
  ) {
    const userEmail = profile.emails[0].value;

    try {
      const user = await this.authService.validateOAuthUser(
        userEmail,
        "Google"
      );
      return done(null, user);
    } catch (e) {
      // Automatically create user if it doesn't exist
      if (e instanceof NotFoundException) {
        const newUser = await this.userAuthService.create({
          email: userEmail,
          isVerified: true,
          authType: "Google",
          oAuthToken: "TEMP_VALUE" // TODO: Discuss this and see if oAuthTokens are needed
        });
        return done(null, newUser);
      }

      return done(e, null);
    }
  }
}