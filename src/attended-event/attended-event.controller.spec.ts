import { Test, TestingModule } from '@nestjs/testing';
import { AttendedEventController } from './attended-event.controller';
import { AttendedEventService } from './attended-event.service';
import { AttendedEvent } from './interfaces/attended-event.interface';
import { User } from 'src/user/interfaces/user.interface';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

class MockAttendedEventService {
  async record() {
    /* Should be overriden using spyOn */
  }
  async findAll() {
    /* Should be overriden using spyOn */
  }
}

describe('AttendedEvent Controller', () => {
  let controller: AttendedEventController;
  let attendedEventService: AttendedEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendedEventController],
      providers: [{
        provide: AttendedEventService,
        useValue: new MockAttendedEventService()
      }]
    }).compile();

    controller = module.get<AttendedEventController>(AttendedEventController);
    attendedEventService = module.get<AttendedEventService>(AttendedEventService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it("should return the list of AttendedEvent objects for a given event", async () => {
    const eventId = "test-id";
    const res = {
      json: (val) => val
    };
    const attendedEvents = [({eventId, userAuthId: "user-auth-id", timestamp: new Date()} as AttendedEvent)];

    jest.spyOn(attendedEventService, "findAll").mockImplementation(
      async (): Promise<AttendedEvent[]> => attendedEvents
    );
    
    const result = await controller.getAttendees(eventId, res);
    expect(result["data"]).toEqual(attendedEvents);
  });

  it("should return the list of AttendedEvent objects for a given user", async () => {
    const userAuthId = "user-auth-id";
    const res = {
      json: (val) => val
    };
    const attendedEvents = [({eventId: "test-id", userAuthId, timestamp: new Date()} as AttendedEvent)];

    jest.spyOn(attendedEventService, "findAll").mockImplementation(
      async (): Promise<AttendedEvent[]> => attendedEvents
    );
    
    const result = await controller.getAttendees(userAuthId, res);
    expect(result["data"]).toEqual(attendedEvents);
  });

  it("should record a new AttendedEvent entry.", async () => {
    const userAuthId = "user-auth-id";
    const eventId = "test-id";
    const user: User = {
      authId: userAuthId
    } as User;
    const res = {
      json: (val) => val
    };
    const attendedEvent = ({
      eventId, userAuthId, timestamp: new Date(),
      toObject: () => attendedEvent
    } as AttendedEvent);

    jest.spyOn(attendedEventService, "record").mockImplementation(
      async (): Promise<AttendedEvent> => attendedEvent
    );
    
    const result = await controller.addAttendedEvent(user, eventId, userAuthId, res);
    expect(result["data"]).toEqual(attendedEvent);
  });

  it("should allow an admin to record an entry for another user", async () => {
    const userAuthId = "user-auth-id";
    const eventId = "test-id";
    const user: User = {
      authId: "admin-auth-id",
      isAdmin: true
    } as User;
    const res = {
      json: (val) => val
    };
    const attendedEvent = ({
      eventId, userAuthId, timestamp: new Date(),
      toObject: () => attendedEvent
    } as AttendedEvent);

    jest.spyOn(attendedEventService, "record").mockImplementation(
      async (): Promise<AttendedEvent> => attendedEvent
    );
    
    const result = await controller.addAttendedEvent(user, eventId, userAuthId, res);
    expect(result["data"]).toEqual(attendedEvent);
  });

  it("should throw an error when a non-admin user tries to record an entry for another user", async () => {
    const userAuthId = "user-auth-id";
    const eventId = "test-id";
    const user: User = {
      authId: "non-admin-user-auth-id"
    } as User;
    const res = {
      json: (val) => val
    };
    const attendedEvent = ({
      eventId, userAuthId, timestamp: new Date(),
      toObject: () => attendedEvent
    } as AttendedEvent);

    jest.spyOn(attendedEventService, "record").mockImplementation(
      async (): Promise<AttendedEvent> => attendedEvent
    );
    
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
      json: (val) => val
    };
    const attendedEvent = ({
      eventId, userAuthId, timestamp: new Date(),
      toObject: () => attendedEvent
    } as AttendedEvent);

    jest.spyOn(attendedEventService, "record").mockImplementation(
      async (): Promise<AttendedEvent> => { throw new BadRequestException(); }
    );
    
    const promise = controller.addAttendedEvent(user, eventId, userAuthId, res);
    await expect(promise).rejects.toThrow(BadRequestException);
  });
});
