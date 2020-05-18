import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserAuth } from "./interfaces/user-auth.interface";
import { CustomParamFactory } from "@nestjs/common/interfaces";

/**
 * Allows you to extract the user parameter from the requets
 */
export const GetUserAuth = createParamDecorator(
  (
    _,
    ctx: ExecutionContext
  ): CustomParamFactory<any, ExecutionContext, UserAuth | undefined> => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
