import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Defaults } from "../defaults";

export const QueryWithDefault = (
  key: string,
  defaultVal: string = Defaults.redirect
): ParameterDecorator => {
  return createParamDecorator((data, ctx: ExecutionContext) => {
    const { key, defaultVal } = data;
    const request = ctx.switchToHttp().getRequest();
    const redirect = request.query[key] || defaultVal;
    return redirect[0] === "/" ? redirect : "/" + redirect;
  })({ key, defaultVal });
};
