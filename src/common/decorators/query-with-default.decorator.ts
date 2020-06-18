import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Constants } from "../constants";

export const QueryWithDefault = (
  key: string,
  defaultVal: string = Constants.defaultRedirect
): ParameterDecorator => {
  return createParamDecorator((data, ctx: ExecutionContext) => {
    const { key, defaultVal } = data;
    const request = ctx.switchToHttp().getRequest();
    const redirect = request.query[key] || defaultVal;
    return redirect[0] === "/" ? redirect : "/" + redirect;
  })({ key, defaultVal });
};
