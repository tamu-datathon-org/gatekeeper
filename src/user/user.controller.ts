import {
  Body,
  Controller,
  Get,
  Query,
  Post,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ModifyUserDto } from "./dto/modify-user.dto";
import { User } from "./interfaces/user.interface";
import { GetUser } from "./user-auth.decorator";
import { UserService } from "./user.service";
import { AdminGuard } from "../auth/guards/admin.guard";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  @UseGuards(AuthGuard("jwt"))
  async root(
    @GetUser() user: User | undefined,
    @Query("authId") authId,
    @Query("email") email
  ) {
    if (!user) return {};
    let userObj = {};
    if (user.isAdmin && authId) {
      userObj = (await this.userService.findByAuthId(authId)) || {};
    } else if (user.isAdmin && email) {
      userObj = (await this.userService.findBy({ email })) || {};
    } else {
      userObj = user.toObject() || {};
    }
    // remove mongo ids
    delete userObj["_id"];
    delete userObj["__v"];
    return userObj;
  }

  @Post()
  @UseGuards(AuthGuard("jwt"))
  async modify(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
      })
    )
    modifiedUser: ModifyUserDto,
    @GetUser() user: User | undefined
  ) {
    await this.userService.update(user.authId, modifiedUser);
    return {
      success: true,
    };
  }

  @Get("/adminify")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  async adminify(
    @Query("userAuthId") userAuthId: string | undefined,
    @Query("email") email: string | undefined
  ) {
    if (!userAuthId && !email) return { success: false };
    if (userAuthId) {
      await this.userService.update(userAuthId, { isAdmin: true });
    } else {
      await this.userService.updateByQuery({ email }, { isAdmin: true });
    }
    return {
      success: true,
    };
  }
}
