import { Test, TestingModule } from "@nestjs/testing";
import { EventController } from "./event.controller";
import { EventService } from "./event.service";
import { Event } from "./interfaces/event.interface";
import { BadRequestException } from "@nestjs/common";
import { UpdateQuery } from "mongoose";

class MockEventService {
  async create() {
    /* Should be overidden using spyOn */
  }

  async update() {
    /* Should be overidden using spyOn */
  }

  async findById() {
    /* Should be overidden using spyOn */
  }
}

describe("Event Controller", () => {
  let controller: EventController;
  let eventService: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: new MockEventService(),
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    eventService = module.get<EventService>(EventService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should be able to create a new event", async () => {
    jest.spyOn(eventService, "create").mockImplementation(
      async (req): Promise<Event> =>
        ({
          name: req.eventName,
          parentId: req.eventParentId,
          description: req.eventDescription,
        } as Event)
    );
    const event = await controller.createEvent(
      "Test Name",
      "Description",
      "parent-id"
    );
    expect(event.name).toEqual("Test Name");
    expect(event.description).toEqual("Description");
    expect(event.parentId).toEqual("parent-id");
  });

  it("should fail to create event when eventName is missing", async () => {
    const promise = controller.createEvent(
      undefined,
      "Description",
      "parent-id"
    );
    await expect(promise).rejects.toThrow(BadRequestException);
  });

  it("should propagate errors for EventService when creating events", async () => {
    jest
      .spyOn(eventService, "create")
      .mockImplementation(async (): Promise<Event> => {
        throw new Error();
      });
    const promise = controller.getEvent(undefined);
    await expect(promise).rejects.toThrow(Error);
  });

  it("should allow creating events without eventDescription and parentId", async () => {
    jest.spyOn(eventService, "create").mockImplementation(
      async (req): Promise<Event> =>
        ({
          name: req.eventName,
          parentId: "",
          description: "",
        } as Event)
    );
    const event = await controller.createEvent(
      "Test Name",
      undefined,
      undefined
    );
    expect(event.name).toEqual("Test Name");
  });

  it("should get an event successfully", async () => {
    jest.spyOn(eventService, "findById").mockImplementation(
      async (): Promise<Event> =>
        ({
          name: "Test Name",
          parentId: "parent-id",
          description: "desc",
        } as Event)
    );
    const event = await controller.getEvent("random-id");
    expect(event.name).toEqual("Test Name");
  });

  it("should fail to get an event when eventId isn't given", async () => {
    const promise = controller.getEvent(undefined);
    await expect(promise).rejects.toThrow(BadRequestException);
  });

  it("should update an event successfully", async () => {
    jest.spyOn(eventService, "update").mockImplementation(async () => {
      return;
    });
    const result = await controller.modifyEvent(
      "event-id",
      "name",
      "desc",
      "parent-id"
    );
    expect(result.success).toEqual(true);
  });

  it("should fail to modify event when eventId is missing", async () => {
    const promise = controller.modifyEvent(
      undefined,
      "name",
      "desc",
      "parent-id"
    );
    await expect(promise).rejects.toThrow(BadRequestException);
  });

  it("should propagate errors for EventService when modifying events", async () => {
    jest.spyOn(eventService, "update").mockImplementation(async () => {
      throw new Error();
    });
    const promise = controller.modifyEvent(
      "random-id",
      "name",
      "desc",
      "parent-id"
    );
    await expect(promise).rejects.toThrow(Error);
  });

  it("should partially update events when a subset of the fields are provided", async () => {
    jest
      .spyOn(eventService, "update")
      .mockImplementation(async (id: string, fields: UpdateQuery<Event>) => {
        // Check that fields contains the subset of fields given to controller.
        if (!fields.name || !fields.parentId) throw new Error();
        // Fields should not contain `description`.
        if ("description" in fields) throw new Error();
      });
    const result = await controller.modifyEvent(
      "random-id",
      "name",
      undefined,
      "parent-id"
    );
    expect(result.success).toBe(true);
  });
});
