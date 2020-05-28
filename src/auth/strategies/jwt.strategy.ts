import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { UserAuthService } from "../../user-auth/user-auth.service";
import { JwtUserNotVerifiedException } from "../exceptions/jwt-user-not-verified.exception";
import { UserService } from "../../user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private userAuthService: UserAuthService,
    private userService: UserService
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
    const userAuth = await this.userAuthService.findByEmail(payload.email);
    if (!userAuth) throw new UnauthorizedException("Invalid user auth");
    if (!userAuth.isVerified)
      throw new JwtUserNotVerifiedException("User not verified", 401);
    
    const user = await this.userService.findByAuthId(userAuth.id);
    if (!user) throw new UnauthorizedException("Invalid user");
    
    done(null, user);
  }
}
