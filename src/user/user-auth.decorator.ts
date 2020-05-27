import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CustomParamFactory } from "@nestjs/common/interfaces";
import { User } from "./interfaces/user.interface";

/**
 * Allows you to extract the user parameter from the requets
 */
export const GetUser = createParamDecorator(
  (
    _,
    ctx: ExecutionContext
  ): CustomParamFactory<any, ExecutionContext, User | undefined> => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
