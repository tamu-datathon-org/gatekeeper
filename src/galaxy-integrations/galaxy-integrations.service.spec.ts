import { Test, TestingModule } from "@nestjs/testing";
import { GalaxyIntegrationsService } from "./galaxy-integrations.service";

describe("GalaxyIntegrationsService", () => {
  let service: GalaxyIntegrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GalaxyIntegrationsService]
    }).compile();

    service = module.get<GalaxyIntegrationsService>(GalaxyIntegrationsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
