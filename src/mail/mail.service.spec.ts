import { Test, TestingModule } from "@nestjs/testing";
import { MailService } from "./mail.service";
import { AxiosResponse } from "axios";

class MockMailCoreService {
  sendMailPayload(params: Record<string, any>): Promise<AxiosResponse> {
    return new Promise((res, reject) => {

    });
  }
};

const testRecipientEmail = "admin@tamudatathon.com";

describe("MailService", () => {
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService]
    }).compile();

    mailService = module.get<MailService>(MailService);
  });

  it("should be defined", () => {
    expect(mailService).toBeDefined();
  });

  describe("sendTextEmail", () => {
    it("should successfully send a test text email.", async () => {
      const result = [200, "Email queued."];

      expect(
        await mailService.sendTextEmail(
          testRecipientEmail,
          "Gatekeeper Test: sendTextMail",
          "Ignore this, it's a test"
        )
      ).toEqual(result);
    });
  });

  describe("sendHTMLEmail", () => {
    it("should successfully send a test HTL email.", async () => {
      const result = [200, "Email queued."];

      expect(
        await mailService.sendHTMLEmail(
          testRecipientEmail,
          "Gatekeeper Test: sendHTMLMail",
          "<h1>Ignore this, it's a test<h1>"
        )
      ).toEqual(result);
    });
  });

  describe("sendTemplatedEmail", () => {
    it("should successfully send a test HTL email.", async () => {
      const result = [200, "Email queued."];
      const templateFilePath = "src/mail/templates/test.ejs";
      const templateVariables = {
        name: "JarJarBinks",
        listStuff: ["The Force", "Lightsabers", "C3P0", "Seagulls"],
        randomWord: "Apricots"
      };

      expect(
        await mailService.sendTemplatedEmail(
          testRecipientEmail,
          "Gatekeeper Test: sendSingleTemplatedEmail",
          templateFilePath,
          templateVariables
        )
      ).toEqual(result);
    });
  });
});
