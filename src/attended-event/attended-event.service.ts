import { Injectable, BadRequestException } from "@nestjs/common";
import { AttendedEvent } from "./interfaces/attended-event.interface";
import { Model, FilterQuery } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { EventService } from "../event/event.service";
import { RecordAttendedEventRequest } from "./dto/record-attended-event-req.dto";
import { UserService } from "../user/user.service";

@Injectable()
export class AttendedEventService {
  constructor(
    @InjectModel("AttendedEvent")
    private attendedEventModel: Model<AttendedEvent>,
    private eventService: EventService,
    private userService: UserService
  ) {}

  /**
   * Record that a user attended this event
   * @param {RecordAttendedEventRequest} req request dto to record an attended event
   */
  async record(req: RecordAttendedEventRequest): Promise<AttendedEvent> {
    const event = await this.eventService.findById(req.eventId);
    if (!event) {
      throw new BadRequestException("Event doesn't exist");
    }

    const user = await this.userService.findByAuthId(req.authId);
    if (!user) {
      throw new BadRequestException("User does not exist");
    }

    const existingAttendedEvents = await this.findAll({
      eventId: event.id,
      userAuthId: user.id
    });

    if (existingAttendedEvents.length > 0) {
      throw new BadRequestException(
        "An AttendedEvent already exists for this user and event"
      );
    }

    const createdAttendedEvent = new this.attendedEventModel({
      userAuthId: user.authId,
      eventId: event.id
    });

    return createdAttendedEvent.save();
  }

  /**
   * Returns a list of AttendedEvents that match a certain query
   * @param {FilterQuery<AttendedEvent>} query find all the AttendedEvents that match a certain criteria. This can be undefined
   */
  async findAll(query?: FilterQuery<AttendedEvent>): Promise<AttendedEvent[]> {
    return this.attendedEventModel.find(query).exec();
  }
}
