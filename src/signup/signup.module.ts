import { Module } from '@nestjs/common';
import { UserAuthModule } from 'src/user-auth/user-auth.module';
import { SignupController } from './signup.controller';

@Module({
  imports: [UserAuthModule],
  controllers: [SignupController]
})
export class SignupModule {}
