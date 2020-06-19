import { Test, TestingModule } from "@nestjs/testing";
import { ResetPasswordService } from "./reset-password.service";
import { UserAuthService } from "../user-auth/user-auth.service";
import { JwtModule } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";
import { MailCoreService } from "../mail/mail-core.service";
import { MockMailCoreService } from "../mail/mocks/mock-mail-core.service";
import { AuthLinkGeneratorService } from "../auth/auth-link-generator.service";

describe("ResetPasswordService", () => {
  let service: ResetPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: "TEST_SECRET" })],
      providers: [
        ResetPasswordService,
        {
          provide: UserAuthService,
          useValue: {}
        },
        MailService,
        {
          provide: MailCoreService,
          useValue: new MockMailCoreService()
        },
        {
          provide: AuthLinkGeneratorService,
          useValue: {}
        }
      ]
    }).compile();

    service = module.get<ResetPasswordService>(ResetPasswordService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
