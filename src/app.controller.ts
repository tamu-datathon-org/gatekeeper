import { Controller, Get, UseGuards, Res } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ResponseBase, ResponseStatus } from "./common/dto/response-base";
import { UserAuthService } from "./user-auth/user-auth.service";
import { GetUser } from "./user/user-auth.decorator";
import { User } from "./user/interfaces/user.interface";
import { AuthService } from "./auth/auth.service";
import { QueryWithDefault } from "./common/decorators/query-with-default.decorator";

@Controller()
export class AppController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly authService: AuthService
  ) {}

  @Get("/")
  async root(@Res() res) {
    return res.redirect("/auth/login");
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("/logout")
  async logout(@GetUser() user: User, @QueryWithDefault("r", "/auth/login") redirect, @Res() res) {
    await this.authService.deauthorizeUser(user, res);
    return res.redirect(redirect);
  }

  // THESE ENDPOINTS BELOW ARE TEMPORARY, REMOVE LATER
  @UseGuards(AuthGuard("jwt"))
  @Get("/me")
  me(@GetUser() user: User): ResponseBase & { yourEmail: string } {
    return {
      yourEmail: user.email,
      status: ResponseStatus.Success
    };
  }
}
