import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const QueryWithDefault = (
  key: string,
  defaultVal: string
): ParameterDecorator => {
  return createParamDecorator((data, ctx: ExecutionContext) => {
    const { key, defaultVal } = data;
    const request = ctx.switchToHttp().getRequest();
    const val = request.query[key];
    return val || defaultVal;
  })({ key, defaultVal });
};
