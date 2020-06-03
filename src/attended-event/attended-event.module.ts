import { Module } from "@nestjs/common";
import { AttendedEventService } from "./attended-event.service";
import { AttendedEventSchema } from "./schemas/attended-event.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "../user/user.module";
import { EventModule } from "../event/event.module";
import { AttendedEventController } from './attended-event.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "AttendedEvent", schema: AttendedEventSchema }
    ]),
    UserModule,
    EventModule
  ],
  providers: [AttendedEventService],
  exports: [AttendedEventService],
  controllers: [AttendedEventController]
})
export class AttendedEventModule {}
