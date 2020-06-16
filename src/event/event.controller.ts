import {
  Controller,
  Post,
  UseGuards,
  Body,
  BadRequestException,
  Patch,
  Query,
  Get
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "../auth/guards/admin.guard";
import { EventService } from "./event.service";

@Controller("event")
export class EventController {
  constructor(private eventService: EventService) {}

  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @Post()
  async createEvent(
    @Body("eventName") eventName: string,
    @Body("eventDescription") eventDescription: string,
    @Body("eventParentId") eventParentId: string
  ) {
    if (!eventName)
      throw new BadRequestException(
        "Request body must include the 'eventName' field"
      );

    const event = await this.eventService.create({
      eventName,
      eventDescription,
      eventParentId
    });
    return event;
  }

  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @Patch()
  async modifyEvent(
    @Query("eventId") eventId: string,
    @Body("eventName") eventName: string,
    @Body("eventDescription") eventDescription: string,
    @Body("eventParentId") eventParentId: string
  ) {
    if (!eventId)
      throw new BadRequestException(
        "Request query params must include the 'eventId' field"
      );
    const updateObj = {};
    if (eventName) updateObj["name"] = eventName;
    if (eventDescription) updateObj["description"] = eventDescription;
    if (eventParentId) updateObj["parentId"] = eventParentId;

    await this.eventService.update(eventId, updateObj);
    return { success: true };
  }

  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @Get()
  async getEvent(@Query("eventId") eventId: string) {
    if (!eventId)
      throw new BadRequestException(
        "Request query params must include the 'eventId' field"
      );
    const event = await this.eventService.findById(eventId);
    // remove mongo ids
    delete event["_id"];
    delete event["__v"];
    return event;
  }
}
