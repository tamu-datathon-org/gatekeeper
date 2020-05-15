import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserAuth } from "../../user-auth/interfaces/user-auth.interface";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
  constructor(private authService: AuthService) {
    super();
  }

  /**
   * Passport JS Local Strategy calls this to get the user on login
   * @param username Username of the user (the email address of the user)
   * @param password Password
   */
  async validate(username: string, password: string): Promise<UserAuth> {
    try {
      const user = await this.authService.validateUser(username, password);
      return user;
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}
