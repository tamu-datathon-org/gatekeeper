import {
  Controller,
  Get,
  UseGuards,
  Query,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException
} from "@nestjs/common";
import { GalaxyIntegrationGuard } from "../auth/guards/galaxy-integration.guard";
import { AttendedEventService } from "./attended-event.service";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "../user/user-auth.decorator";
import { User } from "../user/interfaces/user.interface";
import { UserService } from "../user/user.service";

@Controller("attended/")
export class AttendedEventController {
  constructor(
    private attendedEventService: AttendedEventService,
    private userService: UserService
  ) {}

  @UseGuards(GalaxyIntegrationGuard)
  @Get("/")
  async getAttendedEvents(
    @Query("eventId") eventId,
    @Query("userAuthId") userAuthId
  ) {
    let filter = {};
    if (eventId) filter = { eventId };
    if (userAuthId) filter = { userAuthId, ...filter };

    if (!filter)
      throw new BadRequestException(
        "Request must container eventId or userAuthId"
      );

    const attendedObjects = await this.attendedEventService.findAll(filter);
    return attendedObjects;
  }

  @UseGuards(GalaxyIntegrationGuard)
  @Get("/event")
  async getEventEmails(@Query("eventId") eventId) {
    let filter = {};
    if (eventId) filter = { eventId };

    if (!filter) throw new BadRequestException("Request must contain eventId");

    const attendedObjects = await this.attendedEventService.findAll(filter);
    const attendedEventEmails = [];
    for (let i = 0; i < attendedObjects.length; i++) {
      const userObj = await this.userService.findByAuthId(
        attendedObjects[i].userAuthId
      );
      const userEmail = userObj.email;
      const attendedEmailsObj = {
        timestamp: attendedObjects[i].timestamp,
        userAuthId: attendedObjects[i].userAuthId,
        userEmail: userEmail
      };
      attendedEventEmails.push(attendedEmailsObj);
    }
    return attendedEventEmails;
  }

  @UseGuards(GalaxyIntegrationGuard, AuthGuard("jwt"))
  @Post("/")
  async addAttendedEvent(
    @GetUser() user: User,
    @Body("eventId") eventId: string,
    @Body("userAuthId") userAuthId: string
  ) {
    if (!userAuthId || !eventId) {
      throw new BadRequestException(
        "Body must container eventId and userAuthId"
      );
    }
    // Only admins can post attended events for other users.
    if (!user.isAdmin && user.authId !== userAuthId) {
      throw new UnauthorizedException(
        "User can't post attended events for others."
      );
    }
    const attendedEvent = (
      await this.attendedEventService.record({ eventId, userAuthId })
    ).toObject();
    delete attendedEvent["_id"];
    delete attendedEvent["__v"];
    return attendedEvent;
  }
}
