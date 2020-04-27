import { Injectable, Inject } from '@nestjs/common';
import { UserAuthService } from 'src/user-auth/user-auth.service';
import { SignupUserDto } from './dto/signup-user.dto';
import { CreateUserAuthDto } from 'src/user-auth/dto/create-user-auth.dto';
import { UserAuthType, UserAuth } from '../user-auth/interfaces/user-auth.interface';

@Injectable()
export class SignupService {
  constructor(@Inject(UserAuthService) private userAuthService: UserAuthService){}

  async signupUserEmailAndPassword(signupUserDto: SignupUserDto): Promise<UserAuth> {
    const createUserPayload: CreateUserAuthDto = {
      email: signupUserDto.email,
      password: signupUserDto.password,
      authType: "EmailAndPassword",
      isVerified: false
    }

    return await this.userAuthService.create(createUserPayload);
  }
}
