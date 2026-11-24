import { describe, it, expect } from "vitest";
import { deployHtmlToGitHub, utf8ToBase64, type GitHubTarget } from "../src/github";

interface Call {
  url: string;
  init?: RequestInit;
}

function res(status: number, body: unknown): Response {
  return {
    status,
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  } as unknown as Response;
}

const target: GitHubTarget = { owner: "me", repo: "site", branch: "main", path: "index.html", token: "tok" };

describe("utf8ToBase64", () => {
  it("round-trips ascii and unicode", () => {
    const s = "Hello <svg> café — 文字";
    const back = new TextDecoder().decode(Uint8Array.from(atob(utf8ToBase64(s)), (c) => c.charCodeAt(0)));
    expect(back).toBe(s);
  });
});

describe("deployHtmlToGitHub", () => {
  it("creates a new file (404 → PUT 201) and returns the Pages URL", async () => {
    const calls: Call[] = [];
    const fetchFn = (async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      return calls.length === 1 ? res(404, {}) : res(201, { content: { html_url: "https://github.com/me/site/blob/main/index.html" } });
    }) as unknown as typeof fetch;

    const out = await deployHtmlToGitHub("<h1>hi</h1>", target, fetchFn);
    expect(out.url).toBe("https://me.github.io/site/");
    expect(calls[0].url).toContain("/repos/me/site/contents/index.html?ref=main");
    expect(calls[1].init?.method).toBe("PUT");
    const body = JSON.parse(calls[1].init?.body as string);
    expect(body.branch).toBe("main");
    expect(body.sha).toBeUndefined();
    expect(body.content).toBe(utf8ToBase64("<h1>hi</h1>"));
    expect((calls[1].init?.headers as Record<string, string>).Authorization).toBe("Bearer tok");
  });

  it("updates an existing file (includes the sha)", async () => {
    let putSha: unknown;
    const fetchFn = (async (_url: string, init?: RequestInit) => {
      if (init?.method === "PUT") {
        putSha = JSON.parse(init.body as string).sha;
        return res(200, { content: {} });
      }
      return res(200, { sha: "abc123" });
    }) as unknown as typeof fetch;
    await deployHtmlToGitHub("<x/>", target, fetchFn);
    expect(putSha).toBe("abc123");
  });

  it("throws on a non-404 lookup error", async () => {
    const fetchFn = (async () => res(500, "boom")) as unknown as typeof fetch;
    await expect(deployHtmlToGitHub("<x/>", target, fetchFn)).rejects.toThrow(/500/);
  });

  it("validates required fields", async () => {
    await expect(deployHtmlToGitHub("<x/>", { ...target, token: "" })).rejects.toThrow(/token/);
  });
});
