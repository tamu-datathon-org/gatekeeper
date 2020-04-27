import { Module } from '@nestjs/common';
import { UserAuthModule } from 'src/user-auth/user-auth.module';
import { SignupController } from './signup.controller';
import { SignupService } from './signup.service';

@Module({
  imports: [UserAuthModule],
  controllers: [SignupController],
  providers: [SignupService]
})
export class SignupModule {}
