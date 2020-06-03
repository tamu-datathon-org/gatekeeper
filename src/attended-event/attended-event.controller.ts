import {
  Controller,
  Get,
  UseGuards,
  Query,
  Res,
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

@Controller("attended/")
export class AttendedEventController {
  constructor(private attendedEventService: AttendedEventService) {}

  @UseGuards(GalaxyIntegrationGuard)
  @Get("/event")
  async getAttendees(@Query("eventId") eventId, @Res() res) {
    const attendedObjects = await this.attendedEventService.findAll({
      eventId
    });
    return res.json({ data: attendedObjects });
  }

  @UseGuards(GalaxyIntegrationGuard)
  @Get("/user")
  async getAttendedEvents(@Query("userAuthId") userAuthId, @Res() res) {
    const attendedObjects = await this.attendedEventService.findAll({
      userAuthId
    });
    return res.json({ data: attendedObjects });
  }

  @UseGuards(GalaxyIntegrationGuard)
  @UseGuards(AuthGuard("jwt"))
  @Post("/")
  async addAttendedEvent(
    @GetUser() user: User,
    @Body("eventId") eventId: string,
    @Body("userAuthId") userAuthId: string,
    @Res() res
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
    return res.json({ data: attendedEvent });
  }
}
