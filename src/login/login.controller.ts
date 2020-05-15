import { Controller, Get, Render, Req, UseGuards, Post, Res } from "@nestjs/common";
import { LoginGuard } from "../auth/login.guard";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";
import { AuthService } from "src/auth/auth.service";
import { AuthGuard } from "@nestjs/passport";

type RequestWithUser = Request & { user: UserAuth };

@Controller("login")
export class LoginController {
  constructor(private authService: AuthService) {}

  private applyJwt(req: RequestWithUser, res) {
    const jwt = this.authService.getJwtForUser(req.user);
    return res.cookie("accessToken", jwt, {
      httpOnly: true // Prevent JS access of the cookie on the client
      // secure: true, // Prevent cookie use for non-https stuff.
    });
  }

  @Get()
  @Render("login/index")
  root(@Req() req) {
    return { csrfToken: req.csrfToken() };
  }

  @UseGuards(LoginGuard)
  @Post()
  loginEmailAndPassword(@Req() req: RequestWithUser, @Res() res) {
    this.applyJwt(req, res);
    return res.redirect("/login/main")
  }

  @Get("main")
  @UseGuards(AuthGuard("jwt"))
  testMain() {
    return "This is the main page";
  }
}
