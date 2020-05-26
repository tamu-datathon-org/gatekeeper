import { Module } from "@nestjs/common";
import { AttendedEventService } from "./attended-event.service";
import { AttendedEventSchema } from "./schemas/attended-event.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "AttendedEvent", schema: AttendedEventSchema }
    ])
  ],
  providers: [AttendedEventService]
})
export class AttendedEventModule {}
