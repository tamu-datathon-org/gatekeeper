import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ResponseBase, ResponseStatus } from "./common/dto/response-base";
import { UserAuth } from "./user-auth/interfaces/user-auth.interface";
import { GetUserAuth } from "./user-auth/user-auth.decorator";
import { UserAuthService } from "./user-auth/user-auth.service";

@Controller()
export class AppController {
  constructor(private readonly userAuthService: UserAuthService) {}
  // THESE ENDPOINTS BELOW ARE TEMPORARY, REMOVE LATER
  @UseGuards(AuthGuard("jwt"))
  @Get("/me")
  me(@GetUserAuth() user: UserAuth): ResponseBase & { yourEmail: string } {
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
