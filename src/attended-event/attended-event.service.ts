import { Injectable } from "@nestjs/common";
import { AttendedEvent } from "./interfaces/attended-event.interface";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { EventService } from "../event/event.service";

@Injectable()
export class AttendedEventService {
  constructor(
    @InjectModel("AttendedEvent")
    private attendedEventModel: Model<AttendedEvent>,
    private eventService: EventService
  ) {}
}
