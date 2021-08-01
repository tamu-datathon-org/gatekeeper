import { Test, TestingModule } from "@nestjs/testing";
import { AttendedEventService } from "./attended-event.service";
import { TestDatabaseModule } from "../test-database/test-database.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "../user/user.service";
import { EventService } from "../event/event.service";
import { User } from "../user/interfaces/user.interface";
import { Event } from "../event/interfaces/event.interface";
import { AttendedEventSchema } from "./schemas/attended-event.schema";
import { BadRequestException } from "@nestjs/common";

class MockUserService {
  async create() {
    /* Should be overriden using spyOn */
  }
  async findAll() {
    /* Should be overriden using spyOn */
  }
  async findByAuthId() {
    /* Should be overriden using spyOn */
  }
  async update() {
    /* Should be overriden using spyOn */
  }
}

class MockEventService {
  async create() {
    /* Should be overriden using spyOn */
  }
  async findAll() {
    /* Should be overriden using spyOn */
  }
  async findById() {
    /* Should be overriden using spyOn */
  }
  async update() {
    /* Should be overriden using spyOn */
  }
}

describe("AttendedEventService", () => {
  let service: AttendedEventService;
  let userService: UserService;
  let eventService: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: "AttendedEvent", schema: AttendedEventSchema },
        ]),
      ],
      providers: [
        AttendedEventService,
        { provide: UserService, useValue: new MockUserService() },
        { provide: EventService, useValue: new MockEventService() },
      ],
    }).compile();

    service = module.get<AttendedEventService>(AttendedEventService);
    userService = module.get<UserService>(UserService);
    eventService = module.get<EventService>(EventService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(userService).toBeDefined();
    expect(eventService).toBeDefined();
  });

  it("should record an AttendedEvent given a valid userAuthId and eventId", async () => {
    jest.spyOn(userService, "findByAuthId").mockImplementation(
      async (): Promise<User> =>
        ({
          authId: "random",
          email: "example@example.com",
          notificationEmail: "example@example.com",
        } as User)
    );
    jest.spyOn(eventService, "findById").mockImplementation(
      async (): Promise<Event> =>
        ({
          name: "A Random Event",
          parentId: "root",
          description: "",
          id: "randomEventId",
        } as Event)
    );

    const attendedEvent = await service.record({
      eventId: "randomEventId",
      userAuthId: "random",
    });

    expect(attendedEvent).toBeDefined();
    expect(attendedEvent.eventId).toBe("randomEventId");
    expect(attendedEvent.userAuthId).toBe("random");
  });

  it("should fail to record an AttendedEvent if user doesn't exist", async () => {
    jest
      .spyOn(userService, "findByAuthId")
      .mockImplementation(async (): Promise<User | undefined> => undefined);
    jest.spyOn(eventService, "findById").mockImplementation(
      async (): Promise<Event> =>
        ({
          name: "A Random Event",
          parentId: "root",
          description: "",
          id: "randomEventId",
        } as Event)
    );

    await expect(
      service.record({
        eventId: "randomEventId",
        userAuthId: "random",
      })
    ).rejects.toThrow(new BadRequestException("User does not exist"));
  });

  it("should fail to record an AttendedEvent if event doesn't exist", async () => {
    jest.spyOn(userService, "findByAuthId").mockImplementation(
      async (): Promise<User> =>
        ({
          authId: "random",
          email: "example@example.com",
          notificationEmail: "example@example.com",
        } as User)
    );
    jest
      .spyOn(eventService, "findById")
      .mockImplementation(async (): Promise<Event | undefined> => undefined);

    await expect(
      service.record({
        eventId: "randomEventId",
        userAuthId: "random",
      })
    ).rejects.toThrow(new BadRequestException("Event doesn't exist"));
  });

  it("should fail to record a duplicate AttendedEvent", async () => {
    jest.spyOn(userService, "findByAuthId").mockImplementation(
      async (): Promise<User> =>
        ({
          authId: "random",
          email: "example@example.com",
          notificationEmail: "example@example.com",
        } as User)
    );
    jest.spyOn(eventService, "findById").mockImplementation(
      async (): Promise<Event> =>
        ({
          name: "A Random Event",
          parentId: "root",
          description: "",
          id: "randomEventId",
        } as Event)
    );

    await service.record({
      eventId: "randomEventId",
      userAuthId: "random",
    });

    await expect(
      service.record({
        eventId: "randomEventId",
        userAuthId: "random",
      })
    ).rejects.toThrow(
      new BadRequestException(
        "An AttendedEvent already exists for this user and event"
      )
    );
  });
});
