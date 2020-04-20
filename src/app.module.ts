import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserAuthModule } from './user-auth/user-auth.module';

@Module({
  imports: [AuthModule, UsersModule, UserAuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
