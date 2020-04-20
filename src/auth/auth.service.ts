import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";
import { UserAuthService } from "../user-auth/user-auth.service";

@Injectable()
export class AuthService {
  constructor(private readonly userAuthService: UserAuthService) {}

  async validateUser(email: string, pass: string): Promise<Partial<UserAuth>> {
    const user = await this.userAuthService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      return user;
    }
    return null;
  }
}
