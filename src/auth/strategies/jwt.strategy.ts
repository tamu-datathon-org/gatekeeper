import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { UserAuthService } from "../../user-auth/user-auth.service";
import { JwtUserNotVerifiedException } from "../exceptions/jwt-user-not-verified.exception";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private userAuthService: UserAuthService
  ) {
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
    const user = await this.userAuthService.findByEmail(payload.email);
    if (!user.isVerified)
      throw new JwtUserNotVerifiedException("User not verified", 401);
    // PassportJS automatically checks JWT validity.
    // Make any other validation checks here.
    done(null, payload);
  }
}
