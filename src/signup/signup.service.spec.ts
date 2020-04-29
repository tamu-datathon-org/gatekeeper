import { Test, TestingModule } from "@nestjs/testing";
import { SignupService } from "./signup.service";
import { MailCoreService } from "../mail/mail-core.service";
import { MockMailCoreService } from "../mail/mocks/mock-mail-core.service";
import { MailService } from "../mail/mail.service";
import { UserAuthService } from "../user-auth/user-auth.service";
import { TestDatabaseModule } from "../test-database/test-database.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserAuthSchema } from "../user-auth/schemas/user-auth.schema";

describe("SignupService", () => {
  let service: SignupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: "UserAuth", schema: UserAuthSchema }
        ])
      ],
      providers: [
        SignupService,
        MailService,
        {
          provide: MailCoreService,
          useValue: new MockMailCoreService(),
        },
        UserAuthService
      ]
    }).compile();

    service = module.get<SignupService>(SignupService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should be able to signup a user with email and password", async () => {
    const signupPayload = {
      email: "testy@mcface.com",
      password: "TestPassword"
    };

    const user = await service.signupUserEmailAndPassword(signupPayload);
    expect(user).toBeDefined();
  });
});
