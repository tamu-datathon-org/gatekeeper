import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Constants, validDomainRegex } from "../constants";

export const isHostValid = (
  host: string,
  validHosts: string[] = Constants.validHosts,
  validSubdomainHosts: string[] = Constants.validSubdomainHosts
): boolean => {
  if (!validDomainRegex.test(host)) return false;
  if (validHosts.some(val => host === val)) return true;

  // Check if host is a subdomain of any validSubdomainHosts.
  return validSubdomainHosts.some((subdomainHost: string) => {
    return host.endsWith("." + subdomainHost);
  });
};

export const ValidatedHost = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const host = request.headers["host"];
    if (!host || !isHostValid(host))
      return process.env.DEFAULT_GATEKEEPER_ORIGIN;
    return host;
  }
);
