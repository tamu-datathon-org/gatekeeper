import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAuthService } from './user-auth.service';
import { UserAuthSchema } from './schemas/user-auth.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'UserAuth', schema: UserAuthSchema }])],
  providers: [UserAuthService]
})
export class UserAuthModule {}
