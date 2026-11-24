export interface GitHubTarget {
  owner: string;
  repo: string;
  branch: string;
  /** File path in the repo, e.g. "index.html". */
  path: string;
  /** A GitHub token with contents:write on the repo. Used only for this request; never stored. */
  token: string;
}

export interface DeployResult {
  /** The expected GitHub Pages URL (Pages must be enabled for the repo/branch). */
  url: string;
  /** The commit/content API response URL, when provided. */
  commitUrl?: string;
}

/** UTF-8 safe base64 encoding (chunked to avoid call-stack limits on large input). */
export function utf8ToBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function bodyText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return res.statusText;
  }
}

/**
 * Commit `html` to a file in a GitHub repo (create or update), via the Contents API.
 * Works from the browser (GitHub's API allows CORS). The token is passed through only to
 * api.github.com and is never persisted or logged by this function.
 *
 * `fetchFn` is injectable for testing.
 */
export async function deployHtmlToGitHub(
  html: string,
  target: GitHubTarget,
  fetchFn: typeof fetch = fetch,
): Promise<DeployResult> {
  for (const k of ["owner", "repo", "branch", "path", "token"] as const) {
    if (!target[k]?.trim()) throw new Error(`Missing ${k}`);
  }
  const apiPath = target.path.split("/").map(encodeURIComponent).join("/");
  const base = `https://api.github.com/repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}/contents/${apiPath}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${target.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // Look up the existing file's sha (needed to update it); 404 = new file.
  let sha: string | undefined;
  const getRes = await fetchFn(`${base}?ref=${encodeURIComponent(target.branch)}`, { headers });
  if (getRes.status === 200) {
    const json = (await getRes.json()) as { sha?: string };
    sha = json.sha;
  } else if (getRes.status !== 404) {
    throw new Error(`GitHub lookup failed (${getRes.status}): ${await bodyText(getRes)}`);
  }

  const putRes = await fetchFn(base, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Publish map via Wayfinder Studio",
      content: utf8ToBase64(html),
      branch: target.branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (putRes.status !== 200 && putRes.status !== 201) {
    throw new Error(`GitHub publish failed (${putRes.status}): ${await bodyText(putRes)}`);
  }
  const result = (await putRes.json().catch(() => ({}))) as { content?: { html_url?: string } };

  const sub = target.path === "index.html" ? "" : target.path;
  return {
    url: `https://${target.owner}.github.io/${target.repo}/${sub}`,
    commitUrl: result.content?.html_url,
  };
}
