import { Module, MiddlewareConsumer } from '@nestjs/common';
import { LoginController } from './login.controller';
import { saveRedirectParam } from './middleware/save-redirect-param.middleware';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LoginController]
})
export class LoginModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(saveRedirectParam).forRoutes('login/google$')
  }
}
