import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Constants } from "../constants";

export const isHostValid = (
  host: string,
  validHosts: string[] = Constants.validHosts,
  validSubdomainHosts: string[] = Constants.validSubdomainHosts
): boolean => {
  if (validHosts.some(val => host === val)) return true;

  // Check if host is a subdomain of any validSubdomainHosts.
  const hostTokens = host.split(".");
  return validSubdomainHosts.some((subdomainHost: string) => {
    const subdomainHostTokens = subdomainHost.split(".");
    if (hostTokens.length < subdomainHostTokens.length) return false;
    return hostTokens.slice(hostTokens.length - subdomainHostTokens.length).join(".") === subdomainHost;
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
