import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";
import { UserAuthService } from "../user-auth/user-auth.service";

@Injectable()
export class AuthService {
  constructor(private readonly userAuthService: UserAuthService) {}

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
}
