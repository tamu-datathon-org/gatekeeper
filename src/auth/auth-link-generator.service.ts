import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthLinkGeneratorService {
  constructor(private readonly jwtService: JwtService) {}

  private createOriginFromHost(host: string) {
    if (host.startsWith("https://") || host.startsWith("http://")) return host;
    let scheme = "https";
    if (host.startsWith("localhost")) {
      scheme = "http";
    }
    return `${scheme}://${host}`;
  }

  getLinkWithUserJwt(
    email: string,
    host: string,
    path = "/",
    redirectLink: string
  ) {
    const userJwt = this.jwtService.sign(
      { email },
      {
        expiresIn: process.env.CONFIRMATION_JWT_EXPIRATION,
      }
    );
    const confirmationLink = `${
      this.createOriginFromHost(host) || process.env.DEFAULT_GATEKEEPER_ORIGIN
    }${path}/?user=${userJwt}&r=${redirectLink}`;
    return encodeURI(confirmationLink);
  }
}
