import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import {
  UserAuth,
  OAuthProviders
} from "../user-auth/interfaces/user-auth.interface";
import { UserAuthService } from "../user-auth/user-auth.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Validate User using Email and Password
   * @param email Email Address
   * @param password Password
   */
  async validateUser(email: string, password: string): Promise<UserAuth> {
    const user = await this.userAuthService.findByEmail(email);
    if (
      user &&
      user.authType === "EmailAndPassword" &&
      (await bcrypt.compare(password, user.passwordHash))
    ) {
      return user;
    } else if (user.authType !== "EmailAndPassword") {
      throw new Error(
        "User signed up with a different authentication provider"
      );
    } else {
      throw new NotFoundException("Invalid Credentials");
    }
  }

  async validateOAuthUser(
    email: string,
    provider: OAuthProviders
  ): Promise<UserAuth> {
    const user = await this.userAuthService.findByEmail(email);

    if (!user) throw new NotFoundException("Invalid Credentials");
    if (user.authType !== provider)
      throw new Error(
        "User signed up with a different authentication provider"
      );

    return user;
  }

  /**
   * Generate a JWT token for the user
   * @param user UserAuth object
   */
  getJwtForUser(user: UserAuth) {
    const payload = {
      email: user.email
    };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.AUTH_JWT_EXPIRATION
    });
  }
}
