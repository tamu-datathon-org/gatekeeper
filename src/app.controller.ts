import { Controller, Get, UseGuards, Res } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ResponseBase, ResponseStatus } from "./common/dto/response-base";
import { UserAuthService } from "./user-auth/user-auth.service";
import { GetUser } from "./user/user-auth.decorator";
import { User } from "./user/interfaces/user.interface";
import { AuthService } from "./auth/auth.service";

@Controller()
export class AppController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly authService: AuthService
  ) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("/logout")
  async logout(@GetUser() user: User, @Res() res) {
    await this.authService.deauthorizeUser(user, res);
    return res.redirect("/auth/login");
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

  @Get("/create")
  async create(): Promise<ResponseBase> {
    try {
      await this.userAuthService.create({
        email: "admin@example.com",
        authType: "EmailAndPassword",
        password: "ThisIsATest",
        isVerified: true
      });
      return {
        status: ResponseStatus.Success
      };
    } catch (e) {
      return {
        status: ResponseStatus.Failure,
        message: e.message
      };
    }
  }
}
