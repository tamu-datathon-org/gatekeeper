import { Controller, Post, UseGuards, Get, Req } from "@nestjs/common";
import { ResponseBase, ResponseStatus } from "./common/dto/response-base";
import { LoginGuard } from "./auth/login.guard";
import { UserAuthService } from "./user-auth/user-auth.service";
import { Request } from "express";
import { UserAuth } from "./user-auth/interfaces/user-auth.interface";
import { AuthenticatedGuard } from "./auth/authenticated.guard";

type RequestWithUser = Request & { user: UserAuth };

@Controller()
export class AppController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post("/login")
  @UseGuards(LoginGuard)
  login(@Req() req: RequestWithUser): ResponseBase & { userAuthId: string } {
    return {
      userAuthId: req.user.id,
      status: ResponseStatus.Success
    };
  }

  // THESE ENDPOINTS BELOW ARE TEMPORARY, REMOVE LATER
  @UseGuards(AuthenticatedGuard)
  @Get("/me")
  me(@Req() req: RequestWithUser): ResponseBase & { user: UserAuth } {
    return {
      user: req.user,
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
