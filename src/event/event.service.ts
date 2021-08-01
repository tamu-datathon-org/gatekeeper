import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery, UpdateQuery } from "mongoose";
import { Event } from "./interfaces/event.interface";
import { CreateEventReq } from "./dto/create-event-req.dto";

@Injectable()
export class EventService {
  constructor(@InjectModel("Event") private eventModel: Model<Event>) {}

  /**
   * Create a Event
   * @param {CreateEventReq} req Request to create an event
   */
  async create(req: CreateEventReq): Promise<Event> {
    if (req.eventParentId && req.eventParentId !== "root") {
      const parentEvent = await this.findById(req.eventParentId);
      if (!parentEvent) {
        throw new BadRequestException("Parent Event does not exist");
      }
    }

    const createdEvent = new this.eventModel({
      name: req.eventName,
      parentId: req.eventParentId || "root",
      description: req.eventDescription || "",
    });

    return createdEvent.save();
  }

  /**
   * Returns a list of Events that match a certain query
   * @param {FilterQuery<Event>} query find all the events that match a certain criteria. This can be undefined
   */
  async findAll(query?: FilterQuery<Event>): Promise<Event[]> {
    return this.eventModel.find(query).exec();
  }

  /**
   * Update fields of an event
   * @param {string} id id of the Event to update
   * @param {UpdateQuery<Event>} fields fields to update
   */
  async update(id: string, fields: UpdateQuery<Event>): Promise<void> {
    const event = await this.findById(id);
    if (fields.parentId && fields.parentId !== "root") {
      const parentEvent = await this.findById(fields.parentId);
      if (!parentEvent) {
        throw new BadRequestException("Parent Event does not exist");
      }
    }
    await event.updateOne(fields).exec();
  }

  /**
   * Find one Event by its id.
   * @param {string} id id of the event object to find
   */
  async findById(id: string): Promise<Event | undefined> {
    return (await this.eventModel.findById(id)) || undefined;
  }
}
