import { Module } from '@nestjs/common';
import { EasyconfigModule } from  'nestjs-easyconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [EasyconfigModule.register({safe: true})],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
