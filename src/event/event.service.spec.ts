import { Test, TestingModule } from "@nestjs/testing";
import { EventService } from "./event.service";
import { TestDatabaseModule } from "../test-database/test-database.module";
import { MongooseModule } from "@nestjs/mongoose";
import { EventSchema } from "./schemas/event.schema";
import { CreateEventReq } from "./dto/create-event-req.dto";

describe("EventService", () => {
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([{ name: "Event", schema: EventSchema }])
      ],
      providers: [EventService]
    }).compile();

    service = module.get<EventService>(EventService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should be able to create an event", async () => {
    const createPayload = {
      eventName: "Test Event",
      eventDescription: "Some Text"
    } as CreateEventReq;

    const event = await service.create(createPayload);

    expect(event).toBeDefined();
    expect(event.name).toBe("Test Event");
    expect(event.parentId).toBe("root");
    expect(event.description).toBe("Some Text");
  });

  it("should be able to create an event with a parent event", async () => {
    const createParentEventPayload = {
      eventName: "ParentEvent"
    } as CreateEventReq;

    const parentEvent = await service.create(createParentEventPayload);

    const createChildEventPayload = {
      eventName: "ChildEvent",
      eventParentId: parentEvent.id
    } as CreateEventReq;

    const childEvent = await service.create(createChildEventPayload);

    expect(childEvent).toBeDefined();
    expect(childEvent.name).toBe("ChildEvent");
    expect(childEvent.parentId).toBe(parentEvent.id);
  });

  it("should fail to create an event if the specified parent doesn't exist", async () => {
    const createParentEventPayload = {
      eventName: "ParentEvent"
    } as CreateEventReq;

    await service.create(createParentEventPayload);

    const createChildEventPayload = {
      eventName: "ChildEvent",
      eventParentId: "5eccad133d48002da14db0b6"
    } as CreateEventReq;

    try {
      await service.create(createChildEventPayload);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.status).toBe(400);
      expect(e.message).toBe("Parent Event does not exist");
    }
  });

  it("should find all events and find by id", async () => {
    const createEventPayload1 = {
      eventName: "event1"
    } as CreateEventReq;

    const createEventPayload2 = {
      eventName: "event2"
    } as CreateEventReq;

    const event1 = await service.create(createEventPayload1);
    await service.create(createEventPayload2);

    const foundEvent1 = await service.findById(event1.id);

    expect(foundEvent1.id).toBe(event1.id);
    expect(foundEvent1.name).toBe("event1");

    const findingJustEvent2 = await service.findAll({ name: "event2" });
    expect(findingJustEvent2.length).toBe(1);
    expect(findingJustEvent2[0].name).toBe("event2");

    const findingAll = await service.findAll();
    expect(findingAll.length).toBe(2);
  });

  it("should be able to update an event and fail if parentId doesn't exist", async () => {
    const createPayload = {
      eventName: "event"
    } as CreateEventReq;
    const createParentPayload = {
      eventName: "parentEvent"
    } as CreateEventReq;

    const parentEvent = await service.create(createParentPayload);
    const event = await service.create(createPayload);
    await service.update(event.id, {
      name: "newEventName",
      parentId: parentEvent.id
    });

    const foundEvent = await service.findById(event.id);

    expect(foundEvent.name).toBe("newEventName");
    expect(foundEvent.parentId).toBe(parentEvent.id);

    try {
      await service.update(event.id, {
        name: "AnotherNewEventName",
        parentId: "5eccad133d48002da14db0b6"
      });
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.status).toBe(400);
      expect(e.message).toBe("Parent Event does not exist");
    }
  });
});
