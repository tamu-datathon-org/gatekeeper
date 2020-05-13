import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from "passport-google-oauth20";

// Nest.js does not have good docs on OAuth2 authentication.
// For reference: https://medium.com/@nielsmeima/auth-in-nest-js-and-angular-463525b6e071

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    // http://www.passportjs.org/docs/google/
    super({
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/signup/google/callback',
      passReqToCallback: true,
      scope: ["profile"]
    });
  }

  async validate(request: any, accessToken: string, refreshToken: string, profile, done: Function) {
    console.log("Passport called Google Validate function")
    console.log(profile)
    const user = {
      id: profile.id
    }

    try {
      // TODO: Add logic to register user to database and other needed validation.
      done(null, user);
    } catch (e) {
      console.log(e);
      done(e, null);
    }
  }
}