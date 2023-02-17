import { isHostValid } from "./validated-host.decorator";

describe("isHostValid", () => {
  it("Should return TRUE for an exact match to a host", () => {
    const result = isHostValid(
      "test.com",
      ["test.com", "hello.com"],
      ["google.com"]
    );
    expect(result).toBe(true);
  });

  it("Should return TRUE for a subdomain match to a subdomainHost", () => {
    const result = isHostValid(
      "something.google.com",
      ["test.com", "hello.com"],
      ["google.com"]
    );
    expect(result).toBe(true);
  });

  it("Should return TRUE for localhost", () => {
    const result = isHostValid(
      "localhost",
      ["test.com", "hello.com"],
      ["google.com"]
    );
    expect(result).toBe(true);
  });

  it("Should return TRUE for localhost with a port", () => {
    const result = isHostValid(
      "localhost:8989",
      ["test.com", "hello.com"],
      ["google.com"]
    );
    expect(result).toBe(true);
  });

  it("Should return FALSE for an invalid host", () => {
    const result = isHostValid(
      "thisisinvalid",
      ["test.com", "hello.com", "thisisinvalid.com"],
      ["google.com"]
    );
    expect(result).toBe(false);
  });

  it("Should return FALSE for a host that matches nothing", () => {
    const result = isHostValid(
      "doesnotmatchanything.com",
      ["test.com", "hello.com"],
      ["google.com"]
    );
    expect(result).toBe(false);
  });

  it("Should return FALSE for a direct match to a subdomainHost (and nothing else)", () => {
    const result = isHostValid(
      "google.com",
      ["test.com", "hello.com"],
      ["google.com"]
    );
    expect(result).toBe(false);
  });

  it("Should use default validHosts and validSubdomainhosts when not provided", () => {
    const result = isHostValid("tamudatathon.com");
    expect(result).toBe(true);
  });
});
