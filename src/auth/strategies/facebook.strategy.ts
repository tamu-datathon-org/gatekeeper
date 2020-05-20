import { Injectable, NotFoundException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-facebook";
import { AuthService } from "../auth.service";
import { UserAuthService } from "../../user-auth/user-auth.service";

// Nest.js does not have good docs on OAuth2 authentication.
// For reference: https://medium.com/@nielsmeima/auth-in-nest-js-and-angular-463525b6e071

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "Facebook") {
  constructor(
    private authService: AuthService,
    private userAuthService: UserAuthService
  ) {
    // http://www.passportjs.org/docs/google/
    super({
      clientID: process.env.FACEBOOK_OAUTH_APP_ID,
      clientSecret: process.env.FACEBOOK_OAUTH_APP_SECRET,
      callbackURL: process.env.FACEBOOK_OAUTH_CALLBACK_URL,
      passReqToCallback: true,
      profileFields: ["email"],
      scope: ["email"]
    });
  }

  /**
   * Validates a login through an OAuth provider.
   * NOTE: If a user is not found, it automatically creates the user.
   * @param  {any} request Request object
   * @param  {string} accessToken OAuth Access Token
   * @param  {string} refreshToken OAuth Refresh Token
   * @param  {} profile The user profile from the oAuth provider
   * @param  {(err:any,id?:any)=>void} done Passport strategy callback function
   */
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
        "Facebook"
      );
      return done(null, user);
    } catch (e) {
      // Automatically create user if it doesn't exist
      if (e instanceof NotFoundException) {
        const newUser = await this.userAuthService.create({
          email: userEmail,
          isVerified: true,
          authType: "Facebook",
          oAuthToken: "TEMP_VALUE" // TODO: Discuss this and see if oAuthTokens are needed
        });
        return done(null, newUser);
      }

      return done(e, null);
    }
  }
}
