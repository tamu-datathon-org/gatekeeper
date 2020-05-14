import { Controller, Get, Render, Req, UseGuards, Res } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "../auth/auth.service";

@Controller("login")
export class LoginController {
  constructor(private authService: AuthService) {}

  @Get()
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
  googleLoginCallback(@Req() req, @Res() res) {
    const jwt = this.authService.getJwtForUser(req.user);
    res.cookie("accessToken", jwt, {
      httpOnly: true // Prevent JS access of the cookie on the client
      // secure: true, // Prevent cookie use for non-https stuff.
    });
    // TODO: Redirect this to whatever page comes after login.
    return res.redirect("/login/main");
  }

  @Get("main")
  @UseGuards(AuthGuard("jwt"))
  testMain(@Req() req) {
    return "This is the main page";
  }
}
