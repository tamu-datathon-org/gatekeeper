import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";
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
      throw new Error("Invalid Credentials");
    }
  }

  getJwtForUser(user: UserAuth) {
    const payload = {
      email: user.email
    };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.AUTH_JWT_EXPIRATION
    });
  }
}
