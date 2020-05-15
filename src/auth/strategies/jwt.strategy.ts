import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      secretOrKey: process.env.AUTH_JWT_SECRET,
      jwtFromRequest: req => {
        // Custom cookie extractor for JWT
        if (req && req.cookies) return req.cookies["accessToken"];
        return undefined;
      }
    });
  }

  async validate(payload, done: (err: any, id?: any) => void) {
    try {
      // PassportJS automatically checks JWT validity.
      // Make any other validation checks here.
      done(null, payload);
    } catch (e) {
      throw new UnauthorizedException("Unauthorized");
    }
  }
}
