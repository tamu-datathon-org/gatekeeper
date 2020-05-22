import {
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
  Query
} from "@nestjs/common";
import { GetUserAuth } from "../user-auth/user-auth.decorator";
import { AuthService } from "../auth/auth.service";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";
import { LoginRootExceptionFilter } from "./filters/login-root-exception.filter";
import { AuthGuard } from "@nestjs/passport";
import { LoginProviderExceptionFilter } from "./filters/login-provider-exception.filter";

@Controller("login")
export class LoginController {
  constructor(private authService: AuthService) {}

  @Get("/")
  @Render("login/index")
  root(@Req() req, @Query("r") redirect: string | undefined) {
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
    this.authService.applyJwt(user, res);
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
    this.authService.applyJwt(user, res);
    const redirect = req.session.redirect;
    req.session.redirect = null;
    // TODO: Based on how redirects are done, implement the propagation of the URL from the original request to the callback
    return res.redirect(redirect || "/auth/me");
  }

  @UseFilters(LoginRootExceptionFilter, LoginProviderExceptionFilter) // Need exception filter to handle guard fails (maintain order).
  @UseGuards(AuthGuard("local")) // used to parse out the login credentials and generate a user
  @Post("/")
  loginEmailAndPassword(
    @GetUserAuth() user: UserAuth,
    @Query("r") redirect: string | undefined,
    @Res() res
  ) {
    this.authService.applyJwt(user, res);
    // TODO: make sure the redirect is only a relative url and cannot be a URL outside (like https://google.com)
    return res.redirect(redirect || "/auth/me");
  }
}
