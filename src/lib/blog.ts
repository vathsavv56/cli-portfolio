import { PROFILE } from "../data/portfolio";

const CACHE = new Map<string, string>();
const TIMEOUT_MS = 8_000;

export function blogMarkdownUrl(slug: string): string {
  if (!/^[a-z0-9-]+$/iu.test(slug)) {
    throw new Error(`Invalid blog slug "${slug}".`);
  }

  return `${PROFILE.links.blogMarkdownBase}/${slug}.md`;
}

/**
 * Fetch a post from the same raw GitHub source the website uses. The text is
 * cached in memory for the lifetime of the process; nothing is bundled.
 */
export async function fetchBlogMarkdown(
  slug: string,
  options: { signal?: AbortSignal } = {},
): Promise<string> {
  const url = blogMarkdownUrl(slug);
  const cached = CACHE.get(url);
  if (cached !== undefined) return cached;

  if (options.signal?.aborted) {
    const error = new Error("The request was aborted.");
    error.name = "AbortError";
    throw error;
  }

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener("abort", onAbort, { once: true });

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "v56-cli" },
    });

    if (!response.ok) {
      throw new Error(`The blog source returned HTTP ${response.status}.`);
    }

    const text = await response.text();
    if (text.trim().length === 0) {
      throw new Error("The blog post is empty.");
    }

    CACHE.set(url, text);
    return text;
  } catch (error) {
    if (timedOut) {
      throw new Error("The blog request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", onAbort);
  }
}

export function clearBlogCache(): void {
  CACHE.clear();
}
