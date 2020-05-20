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
import { LoginProviderExceptionFilter } from "./filters/login-provider-exception-filter";

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
  root(@Req() req, @Param("r") redirect: string | undefined) {
    return {
      csrfToken: req.csrfToken(),
      redirectLink: redirect || "/auth/me"
    };
  }

  @Get("google")
  @UseFilters(new LoginProviderExceptionFilter())
  @UseGuards(AuthGuard("Google"))
  googleLogin() {
    // Passport handles redirects to google's login pages.
  }

  @Get("google/callback")
  @UseFilters(new LoginProviderExceptionFilter())
  // The Strategy (GoogleStrategy) does not re-validate for this endpoint
  @UseGuards(AuthGuard("Google"))
  googleLoginCallback(@Req() req, @GetUserAuth() user: UserAuth, @Res() res) {
    // TODO: Add error handling for when user does not exist. That mostly shouldn't happen due to the Google AuthGuard
    this.applyJwt(user, res);
    const redirect = req.session.redirect;
    req.session.redirect = null;
    // TODO: Based on how redirects are done, implement the propagation of the URL from the original request to the callback
    return res.redirect(redirect || "/auth/me");
  }

  @Get("facebook")
  @UseGuards(AuthGuard("Facebook"))
  facebookLogin() {
    // Passport handles redirects to google's login pages.
  }

  @UseFilters(new LoginProviderExceptionFilter())
  @Get("facebook/callback")
  // The Strategy (GoogleStrategy) does not re-validate for this endpoint
  @UseGuards(AuthGuard("Facebook"))
  facebookLoginCallback(@Req() req, @GetUserAuth() user: UserAuth, @Res() res) {
    // TODO: Add error handling for when user does not exist. That mostly shouldn't happen due to the Facebook AuthGuard
    this.applyJwt(user, res);
    const redirect = req.session.redirect;
    req.session.redirect = null;
    // TODO: Based on how redirects are done, implement the propagation of the URL from the original request to the callback
    return res.redirect(redirect || "/auth/me");
  }

  @UseFilters(LoginRootExceptionFilter, LoginProviderExceptionFilter) // Need exception filter to handle guard fails (maintain order).
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
