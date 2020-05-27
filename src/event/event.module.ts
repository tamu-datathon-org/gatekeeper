import { Module } from "@nestjs/common";
import { EventService } from "./event.service";
import { EventSchema } from "./schemas/event.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Event", schema: EventSchema }])
  ],
  providers: [EventService],
  exports: [EventService]
})
export class EventModule {}
