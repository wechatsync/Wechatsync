import { afterEach, describe, expect, it, vi } from "vitest";
import { publish as publishWordPress } from "../src/adapters/cms/wordpress.ts";
import {
  publish as publishMetaWeblog,
  publishToTypecho,
} from "../src/adapters/cms/metaweblog.ts";

const credentials = {
  url: "https://blog.example.com",
  username: "author",
  password: "application-password",
};

function successfulXmlRpcResponse() {
  return new Response(
    '<?xml version="1.0"?><methodResponse><params><param><value><string>123</string></value></param></params></methodResponse>',
    { status: 200, headers: { "content-type": "text/xml" } },
  );
}

function mockSuccessfulFetch() {
  const fetchMock = vi
    .fn()
    .mockImplementation(async () => successfulXmlRpcResponse());
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function requestBody(fetchMock: ReturnType<typeof vi.fn>): string {
  return String(fetchMock.mock.calls[0]?.[1]?.body || "");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CMS article content fallback", () => {
  it("publishes editor HTML through WordPress when content is absent", async () => {
    const fetchMock = mockSuccessfulFetch();

    const result = await publishWordPress(
      credentials,
      {
        title: "HTML article",
        html: "<p>Hello WordPress</p>",
      },
      { processImages: false },
    );

    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);
    expect(requestBody(fetchMock)).toContain(
      "&lt;p&gt;Hello WordPress&lt;/p&gt;",
    );
  });

  it("publishes editor HTML through MetaWeblog when content is absent", async () => {
    const fetchMock = mockSuccessfulFetch();

    const result = await publishMetaWeblog(
      credentials,
      {
        title: "HTML article",
        html: "<p>Hello MetaWeblog</p>",
      },
      { processImages: false },
    );

    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);
    expect(requestBody(fetchMock)).toContain(
      "&lt;p&gt;Hello MetaWeblog&lt;/p&gt;",
    );
  });

  it("publishes editor HTML through Typecho when content is absent", async () => {
    const fetchMock = mockSuccessfulFetch();

    const result = await publishToTypecho(
      credentials,
      {
        title: "HTML article",
        html: "<p>Hello Typecho</p>",
      },
      { processImages: false },
    );

    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);
    expect(requestBody(fetchMock)).toContain(
      "&lt;p&gt;Hello Typecho&lt;/p&gt;",
    );
  });
});
