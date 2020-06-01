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
import { User } from "../user/interfaces/user.interface";
import uuid = require("uuid");
import { UserNotVerifiedException } from "./exceptions/user-not-verified.exception";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Validate User using Email and Password
   * @param email Email Address
   * @param password Password
   */
  async validateUser(email: string, password: string): Promise<User> {
    const userAuth = await this.userAuthService.findByEmail(email);
    if (
      userAuth &&
      userAuth.authType === "EmailAndPassword" &&
      (await bcrypt.compare(password, userAuth.passwordHash))
    ) {
      if (!userAuth.isVerified)
        throw new UserNotVerifiedException("User not verified", 401);

      const user = this.userService.findByAuthId(userAuth.id);
      if (!user) throw new UnauthorizedException("Invalid Credentials");
      return user;
    } else if (userAuth && userAuth.authType !== "EmailAndPassword") {
      throw new AuthProviderException(userAuth.authType, 401);
    } else if (
      userAuth &&
      !(await bcrypt.compare(password, userAuth.passwordHash))
    ) {
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
  ): Promise<User> {
    const userAuth = await this.userAuthService.findByEmail(email);

    if (!userAuth) throw new NotFoundException("Invalid Credentials");
    if (userAuth.authType !== provider) {
      throw new AuthProviderException(userAuth.authType, 401);
    }

    const user = this.userService.findByAuthId(userAuth.id);
    if (!user) throw new UnauthorizedException("Invalid Credentials");
    return user;
  }

  /**
   * Generate a JWT token for the user
   * @param user UserAuth object
   */
  private getJwtForUser(user: UserAuth) {
    const payload = {
      id: user.id,
      accessId: user.accessId,
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
  async authorizeUser(user: User, res) {
    const userAuth = await this.userAuthService.findById(user.authId);
    if (!userAuth)
      throw new UnauthorizedException("UserAuth does not exist for user");

    if (!userAuth.accessId) {
      userAuth.accessId = uuid.v4();
      await userAuth.save();
    }
    const jwt = this.getJwtForUser(userAuth);
    return res.cookie("accessToken", jwt, {
      httpOnly: true // Prevent JS access of the cookie on the client
      // secure: true, // Prevent cookie use for non-https stuff.
    });
  }

  /**
   * Clears the accessId in the UserAuth object of the given user
   * and removes the accessToken cookie.
   * @param  {User} user The UserAuth object for the given user
   * @param  {} res The request response object to attach the JWT to
   */
  async deauthorizeUser(user: User, res) {
    const userAuth = await this.userAuthService.findById(user.authId);
    if (!userAuth)
      throw new UnauthorizedException("UserAuth does not exist for user");

    userAuth.accessId = undefined;
    await userAuth.save();

    return res.clearCookie("accessToken");
  }
}
