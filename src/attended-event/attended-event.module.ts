import { Module } from "@nestjs/common";
import { AttendedEventService } from "./attended-event.service";
import { AttendedEventSchema } from "./schemas/attended-event.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "../user/user.module";
import { EventModule } from "../event/event.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "AttendedEvent", schema: AttendedEventSchema }
    ]),
    UserModule,
    EventModule
  ],
  providers: [AttendedEventService],
  exports: [AttendedEventService]
})
export class AttendedEventModule {}
