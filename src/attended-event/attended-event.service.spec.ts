import { Test, TestingModule } from "@nestjs/testing";
import { AttendedEventService } from "./attended-event.service";

describe("AttendedEventService", () => {
  let service: AttendedEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendedEventService]
    }).compile();

    service = module.get<AttendedEventService>(AttendedEventService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
