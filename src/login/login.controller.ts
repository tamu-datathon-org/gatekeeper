import {
  Controller,
  Get,
  Param,
  Post,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards
} from "@nestjs/common";
import { GetUserAuth } from "../user-auth/user-auth.decorator";
import { AuthService } from "../auth/auth.service";
import { LoginGuard } from "../auth/login.guard";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";
import { LoginRootExceptionFilter } from "./filters/login-root-exception.filter";
import { AuthGuard } from "@nestjs/passport";

@Controller("login")
export class LoginController {
  constructor(private authService: AuthService) {}
  /**
   * Gets the JWT for the given user and attaches it to the response in a cookie.
   * @param {UserAuth} user The UserAuth object for the given user
   * @param {} res The request response object to attach the JWT to
   */
  private applyJwt(user: UserAuth, res) {
    const jwt = this.authService.getJwtForUser(user);
    return res.cookie("accessToken", jwt, {
      httpOnly: true // Prevent JS access of the cookie on the client
      // secure: true, // Prevent cookie use for non-https stuff.
    });
  }

  @Get("/")
  @Render("login/index")
  root(@Req() req) {
    return { csrfToken: req.csrfToken() };
  }

  @Get("google")
  @UseGuards(AuthGuard("Google"))
  googleLogin() {
    // Passport handles redirects to google's login pages.
  }

  @Get("google/callback")
  // The Strategy (GoogleStrategy) does not re-validate for this endpoint
  @UseGuards(AuthGuard("Google"))
  googleLoginCallback(
    @GetUserAuth() user: UserAuth,
    @Param("r") redirect: string | undefined,
    @Res() res
  ) {
    // TODO: Add error handling for when user does not exist. That mostly shouldn't happen due to the Google AuthGuard
    this.applyJwt(user, res);
    // TODO: Based on how redirects are done, implement the propagation of the URL from the original request to the callback
    return res.redirect(redirect || "/auth/me");
  }

  @UseFilters(new LoginRootExceptionFilter()) // Need exception filter to handle guard fails.
  @UseGuards(LoginGuard) // used to parse out the login credentials and generate a user
  @Post("/")
  loginEmailAndPassword(
    @GetUserAuth() user: UserAuth,
    @Param("r") redirect: string | undefined,
    @Res() res
  ) {
    this.applyJwt(user, res);
    // TODO: make sure the redirect is only a relative url and cannot be a URL outside (like https://google.com)
    return res.redirect(redirect || "/auth/me");
  }
}
