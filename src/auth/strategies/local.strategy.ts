import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { UserAuth } from "../../user-auth/interfaces/user-auth.interface";
import { AuthService } from "../auth.service";

/**
 * Strategy to allow requests to authenticate with a username and password in the request body.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
  constructor(private authService: AuthService) {
    // change the expected request fields to be email and password
    // instead of username and password
    super({
      usernameField: "email",
      passwordField: "password"
    });
  }

  /**
   * Passport JS Local Strategy calls this to get the user on login
   * @param username Username of the user (the email address of the user)
   * @param password Password
   */
  async validate(username: string, password: string): Promise<UserAuth> {
    const user = await this.authService.validateUser(username, password);
    return user;
  }
}
