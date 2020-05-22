import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import {
  UserAuth,
  OAuthProviders
} from "../user-auth/interfaces/user-auth.interface";
import { UserAuthService } from "../user-auth/user-auth.service";
import { JwtService } from "@nestjs/jwt";
import { AuthProviderException } from "./exceptions/auth-provider.exception";

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
    } else if (user && user.authType !== "EmailAndPassword") {
      throw new AuthProviderException(user.authType, 401);
    } else if (user) {
      throw new UnauthorizedException("Invalid Credentials");
    } else {
      throw new NotFoundException("Invalid Credentials");
    }
  }
  /**
   * Validate a user login with OAuthProviders
   * @param {string} email User email
   * @param {OAuthProviders} provider The type of provider being used
   */
  async validateOAuthUser(
    email: string,
    provider: OAuthProviders
  ): Promise<UserAuth> {
    const user = await this.userAuthService.findByEmail(email);

    if (!user) throw new NotFoundException("Invalid Credentials");
    if (user.authType !== provider) {
      throw new AuthProviderException(user.authType, 401);
    }

    return user;
  }

  /**
   * Generate a JWT token for the user
   * @param user UserAuth object
   */
  private getJwtForUser(user: UserAuth) {
    const payload = {
      email: user.email
    };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.AUTH_JWT_EXPIRATION
    });
  }

  /**
   * Gets the JWT for the given user and attaches it to the response in a cookie.
   * @param {UserAuth} user The UserAuth object for the given user
   * @param {} res The request response object to attach the JWT to
   */
  applyJwt(user: UserAuth, res) {
    const jwt = this.getJwtForUser(user);
    return res.cookie("accessToken", jwt, {
      httpOnly: true // Prevent JS access of the cookie on the client
      // secure: true, // Prevent cookie use for non-https stuff.
    });
  }
}
