import { Test, TestingModule } from "@nestjs/testing";
import { AttendedEventController } from "./attended-event.controller";
import { AttendedEventService } from "./attended-event.service";
import { AttendedEvent } from "./interfaces/attended-event.interface";
import { User } from "../user/interfaces/user.interface";
import { UnauthorizedException, BadRequestException } from "@nestjs/common";

class MockAttendedEventService {
  async record() {
    /* Should be overriden using spyOn */
  }
  async findAll() {
    /* Should be overriden using spyOn */
  }
}

describe("AttendedEvent Controller", () => {
  let controller: AttendedEventController;
  let attendedEventService: AttendedEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendedEventController],
      providers: [
        {
          provide: AttendedEventService,
          useValue: new MockAttendedEventService()
        }
      ]
    }).compile();

    controller = module.get<AttendedEventController>(AttendedEventController);
    attendedEventService = module.get<AttendedEventService>(
      AttendedEventService
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return the list of AttendedEvent objects for a given event", async () => {
    const userAuthId = "user-auth-id";
    const eventId = "test-id";
    const res = {
      send: val => val
    };
    const attendedEvents = [
      {
        eventId,
        userAuthId,
        timestamp: new Date()
      } as AttendedEvent
    ];

    jest.spyOn(attendedEventService, "findAll").mockImplementation(
      async (filter): Promise<AttendedEvent[]> => {
        // Check that filter only container eventId as userAuthId should be undefined.
        if ("userAuthId" in filter || !("eventId" in filter)) throw new Error();
        return attendedEvents;
      }
    );

    const result = await controller.getAttendedEvents(eventId, undefined, res);
    expect(result).toEqual(attendedEvents);
  });

  it("should return the list of AttendedEvent objects for a given user", async () => {
    const userAuthId = "user-auth-id";
    const eventId = "test-event-id";
    const res = {
      send: val => val
    };
    const attendedEvents = [
      { eventId, userAuthId, timestamp: new Date() } as AttendedEvent
    ];

    jest.spyOn(attendedEventService, "findAll").mockImplementation(
      async (filter): Promise<AttendedEvent[]> => {
        // Check that filter only container userAuthId as eventId should be undefined.
        if ("eventId" in filter || !("userAuthId" in filter)) throw new Error();
        return attendedEvents;
      }
    );

    const result = await controller.getAttendedEvents(
      undefined,
      userAuthId,
      res
    );
    expect(result).toEqual(attendedEvents);
  });

  it("should return the list of AttendedEvent objects when given both event and user IDs", async () => {
    const userAuthId = "user-auth-id";
    const eventId = "test-event-id";
    const res = {
      send: val => val
    };
    const attendedEvents = [
      { eventId, userAuthId, timestamp: new Date() } as AttendedEvent
    ];

    jest.spyOn(attendedEventService, "findAll").mockImplementation(
      async (filter): Promise<AttendedEvent[]> => {
        // Check that filter contains both event and userAuth IDs.
        if (!("eventId" in filter && "userAuthId" in filter)) throw new Error();
        return attendedEvents;
      }
    );

    const result = await controller.getAttendedEvents(eventId, userAuthId, res);
    expect(result).toEqual(attendedEvents);
  });

  it("should record a new AttendedEvent entry.", async () => {
    const userAuthId = "user-auth-id";
    const eventId = "test-id";
    const user: User = {
      authId: userAuthId
    } as User;
    const res = {
      send: val => val
    };
    const attendedEvent = {
      eventId,
      userAuthId,
      timestamp: new Date(),
      toObject: () => attendedEvent
    } as AttendedEvent;

    jest
      .spyOn(attendedEventService, "record")
      .mockImplementation(async (): Promise<AttendedEvent> => attendedEvent);

    const result = await controller.addAttendedEvent(
      user,
      eventId,
      userAuthId,
      res
    );
    expect(result).toEqual(attendedEvent);
  });

  it("should allow an admin to record an entry for another user", async () => {
    const userAuthId = "user-auth-id";
    const eventId = "test-id";
    const user: User = {
      authId: "admin-auth-id",
      isAdmin: true
    } as User;
    const res = {
      send: val => val
    };
    const attendedEvent = {
      eventId,
      userAuthId,
      timestamp: new Date(),
      toObject: () => attendedEvent
    } as AttendedEvent;

    jest
      .spyOn(attendedEventService, "record")
      .mockImplementation(async (): Promise<AttendedEvent> => attendedEvent);

    const result = await controller.addAttendedEvent(
      user,
      eventId,
      userAuthId,
      res
    );
    expect(result).toEqual(attendedEvent);
  });

  it("should throw an error when a non-admin user tries to record an entry for another user", async () => {
    const userAuthId = "user-auth-id";
    const eventId = "test-id";
    const user: User = {
      authId: "non-admin-user-auth-id"
    } as User;
    const res = {
      send: val => val
    };
    const attendedEvent = {
      eventId,
      userAuthId,
      timestamp: new Date(),
      toObject: () => attendedEvent
    } as AttendedEvent;

    jest
      .spyOn(attendedEventService, "record")
      .mockImplementation(async (): Promise<AttendedEvent> => attendedEvent);

    const promise = controller.addAttendedEvent(user, eventId, userAuthId, res);
    await expect(promise).rejects.toThrow(UnauthorizedException);
  });

  it("should propagate any errors thrown by AttendedEventService when trying to record an entry", async () => {
    const userAuthId = "user-auth-id";
    const eventId = "test-id";
    const user: User = {
      authId: userAuthId
    } as User;
    const res = {
      send: val => val
    };
    const attendedEvent = {
      eventId,
      userAuthId,
      timestamp: new Date(),
      toObject: () => attendedEvent
    } as AttendedEvent;

    jest.spyOn(attendedEventService, "record").mockImplementation(
      async (): Promise<AttendedEvent> => {
        throw new BadRequestException();
      }
    );

    const promise = controller.addAttendedEvent(user, eventId, userAuthId, res);
    await expect(promise).rejects.toThrow(BadRequestException);
  });
});
