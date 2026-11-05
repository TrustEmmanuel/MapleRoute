import { describe, expect, it } from "vitest";

import { scrubEvent, scrubText, scrubUrl } from "./scrub";

describe("scrubUrl", () => {
  it("removes query strings and fragments", () => {
    expect(
      scrubUrl("https://mapleroute.app/share?done=12&total=53&score=512#card"),
    ).toBe("https://mapleroute.app/share");
  });

  it("keeps relative paths clean", () => {
    expect(scrubUrl("/express-entry?step=abc#top")).toBe("/express-entry");
  });
});

describe("scrubText", () => {
  it("redacts email addresses and long numbers", () => {
    expect(
      scrubText("ada@example.com failed with UCI 12345678 at step 12"),
    ).toBe("[email] failed with UCI [number] at step 12");
  });

  it("strips query strings from URLs inside messages", () => {
    expect(
      scrubText(
        "Failed at https://mapleroute.app/share?done=12&score=512 and /share?score=512#card",
      ),
    ).toBe("Failed at https://mapleroute.app/share and /share");
  });

  it("caps long text", () => {
    expect(scrubText("x".repeat(900))).toHaveLength(500);
  });
});

describe("scrubEvent", () => {
  it("drops user and extra data, and cleans URLs and messages", () => {
    const event = scrubEvent({
      request: {
        url: "https://mapleroute.app/crs?score=512",
      },
      user: { email: "ada@example.com" },
      extra: { answer: "secret" },
      message: "Failed for ada@example.com",
      breadcrumbs: [
        {
          message: "Navigated to https://mapleroute.app/share?score=512",
          data: { url: "https://mapleroute.app/share?score=512" },
        },
      ],
      exception: {
        values: [{ type: "Error", value: "boom for 123456789" }],
      },
      contexts: {
        culture: { timezone: "Africa/Lagos" },
        trace: { trace_id: "abc", span_id: "def" },
        browser: { name: "Edge" },
      },
    });

    expect(event.request?.url).toBe("https://mapleroute.app/crs");
    expect(event.user).toBeUndefined();
    expect(event.extra).toBeUndefined();
    expect(event.contexts?.culture).toBeUndefined();
    expect(event.contexts?.trace).toBeUndefined();
    expect(event.contexts?.browser).toEqual({ name: "Edge" });
    expect(event.message).toBe("Failed for [email]");
    expect(event.breadcrumbs?.[0].data?.url).toBe(
      "https://mapleroute.app/share",
    );
    expect(event.exception?.values?.[0].value).toBe("boom for [number]");
  });
});
