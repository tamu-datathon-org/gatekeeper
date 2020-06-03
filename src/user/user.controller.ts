import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  ValidationPipe
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ModifyUserDto } from "./dto/modify-user.dto";
import { User } from "./interfaces/user.interface";
import { GetUser } from "./user-auth.decorator";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  @UseGuards(AuthGuard("jwt"))
  async root(@GetUser() user: User | undefined) {
    if (!user) return {};
    const userObj = user.toObject();
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
        forbidUnknownValues: true
      })
    )
    modifiedUser: ModifyUserDto,
    @GetUser() user: User | undefined
  ) {
    console.log(modifiedUser);
    await this.userService.update(user.authId, modifiedUser);
    return {
      success: true
    };
  }
}
