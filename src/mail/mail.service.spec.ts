import { Test, TestingModule } from "@nestjs/testing";
import { MailService } from "./mail.service";
import { AxiosResponse } from "axios";
import { MailCoreService } from "./mail-core.service";
import { MailgunPayloadDto } from "./dto/mailgun-payload.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
class MockMailCoreService {
  async sendMailPayload(params: MailgunPayloadDto): Promise<AxiosResponse> {
    const requiredParams = ["to", "from", "subject"];
    if (!requiredParams.every(key => params[key])) {
      throw new Error("Required params not found");
    }
    return undefined;
  }
}

const testRecipientEmail = "admin@tamudatathon.com";

describe("MailService", () => {
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailCoreService,
          useValue: new MockMailCoreService()
        }
      ]
    }).compile();

    mailService = module.get<MailService>(MailService);
  });

  it("should be defined", () => {
    expect(mailService).toBeDefined();
  });

  describe("sendTextEmail", () => {
    it("should successfully send a test text email.", async () => {
      const mailParams = {
        emailTo: testRecipientEmail,
        subject: "Gatekeeper Test: sendTextMail",
        bodyText: "Ignore this, it's a test"
      };

      // Function should return nothing if it succeeds.
      expect(await mailService.sendTextEmail(mailParams)).toEqual(undefined);
    });
  });

  describe("sendHTMLEmail", () => {
    it("should successfully send a test HTL email.", async () => {
      const mailParams = {
        emailTo: testRecipientEmail,
        subject: "Gatekeeper Test: sendHTMLEmail",
        bodyHTML: "<h1>Ignore this, it's a test<h1>"
      };

      // Function should return nothing if it succeeds.
      expect(await mailService.sendHTMLEmail(mailParams)).toEqual(undefined);
    });
  });

  describe("sendTemplatedEmail", () => {
    it("should successfully send a test HTL email.", async () => {
      const mailParams = {
        emailTo: testRecipientEmail,
        subject: "Gatekeeper Test: sendTemplatedEmail",
        templateFile: "test.ejs",
        templateParams: {
          name: "JarJarBinks",
          listStuff: ["The Force", "Lightsabers", "C3P0", "Seagulls"],
          randomWord: "Apricots"
        }
      };

      // Function should return nothing if it succeeds.
      expect(await mailService.sendTemplatedEmail(mailParams)).toEqual(
        undefined
      );
    });
  });
});
