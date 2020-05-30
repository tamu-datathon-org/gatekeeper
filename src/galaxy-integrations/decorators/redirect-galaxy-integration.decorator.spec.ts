import { getLongestMatchingPrefix } from "./redirect-galaxy-integration.decorator";

describe("getLongestMatchingPrefix", () => {
  it("should find a direct matching path (if its the longest)", () => {
    const prefixes = ["/apply", "/auth", "/workshops", "/links"];
    const result = getLongestMatchingPrefix("/workshops", prefixes);
    expect(result).toBe("/workshops");
  });

  it("should find the LONGEST path prefix", () => {
    const prefixes = ["/apply", "/auth", "/auth/me", "/workshops", "/links"];
    const result = getLongestMatchingPrefix("/auth/me/edit", prefixes);
    expect(result).toBe("/auth/me");
  });

  it("should find the longest PATH prefix (not a simple string prefix)", () => {
    const prefixes = ["/apply", "/auth", "/authenticate/me", "/links"];
    const result = getLongestMatchingPrefix("/auth/me/edit", prefixes);
    expect(result).toBe("/auth");
  });

  it("should be case-insensitive in its search (but retain case in return value)", () => {
    const prefixes = ["/apply", "/AuTH", "/WORKSHOPS", "/lINks"];
    const result = getLongestMatchingPrefix("/auth/me/EDIT", prefixes);
    expect(result).toBe("/AuTH");
  });

  it("should return an empty string on no match.", () => {
    const prefixes = ["/apply", "/auth", "/workshops", "/links"];
    const result = getLongestMatchingPrefix("/no-match-here", prefixes);
    expect(result).toBe("");
  });
});
