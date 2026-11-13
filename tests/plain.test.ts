import { describe, expect, test } from "bun:test";
import {
  helpBlocks,
  renderHelp,
  renderPlain,
  renderVersion,
  type PostMarkdownFetcher,
} from "../src/lib/plain";
import { layoutBlocks, textLine } from "../src/lib/document";

const ANSI = /\u001B\[[0-9;]*m/gu;

const SAMPLE_MARKDOWN = `# Local First Software

Fetched in tests, not bundled.

## A fetched heading

- one
- two

A paragraph with **bold** text.
`;

const fetchSample: PostMarkdownFetcher = async () => SAMPLE_MARKDOWN;

async function plain(
  section: Parameters<typeof renderPlain>[0]["section"],
  width: number,
  fetcher: PostMarkdownFetcher = fetchSample,
): Promise<string> {
  return renderPlain({
    section,
    width,
    color: false,
    fetchPostMarkdown: fetcher,
  });
}

function expectWidth(output: string, width: number): void {
  const long = output
    .split("\n")
    .map((line) => line.replace(/\s+$/u, ""))
    .filter((line) => Array.from(line).length > width);

  expect(long).toEqual([]);
}

describe("renderPlain", () => {
  test("renders the home section", async () => {
    const output = await plain("home", 88);

    expect(output).toContain("Vathsav Inavolu");
    expect(output).toContain("▌ About Me");
    expect(output).toContain("Curious · Relentless · Driven");
    expect(output).toContain("Jai Sri Ram");
    expect(output).toContain("npx @vathsavv56/v56");
    expect(output).not.toMatch(ANSI);
  });

  test("renders every section when no section is passed", async () => {
    const output = await plain(null, 88);

    for (const marker of [
      "About Me",
      "Featured Projects",
      "▌ Projects",
      "▌ Writing",
      "On Living Fully",
      "▌ Contact",
    ]) {
      expect(output).toContain(marker);
    }

    expect(output).not.toContain("▌ Resume");
  });

  test("prints the writing heading exactly once", async () => {
    const output = await plain("writing", 88);
    const headings = output.match(/▌ Writing/gu) ?? [];

    expect(headings).toHaveLength(1);
  });

  test("renders fetched markdown for blog posts", async () => {
    const output = await plain("writing", 88);

    expect(output).toContain("Fetched live from the portfolio's blog source.");
    expect(output).toContain("Fetched in tests, not bundled.");
    expect(output).toContain("▌ A fetched heading");
    expect(output).toContain("• one");
    expect(output).toContain("bold");
  });

  test("fetches only the blog post, not the essay", async () => {
    const slugs: string[] = [];
    await plain("writing", 88, async (slug) => {
      slugs.push(slug);
      return SAMPLE_MARKDOWN;
    });

    expect(slugs).toEqual(["local-first-software"]);
  });

  test("falls back to the online link when fetching fails", async () => {
    const output = await plain("writing", 88, async () => {
      throw new Error("offline");
    });

    expect(output).toContain("The post could not be fetched.");
    expect(output).toContain("read online");
    expect(output).toContain(
      "https://vathsavv56.vercel.app/blogs/local-first-software",
    );
  });

  test("does not repeat the copy typo", async () => {
    const output = await plain("contact", 88);

    expect(output).not.toContain("a agency");
    expect(output).toContain("an agency");
  });

  test("keeps all lines within the requested width", async () => {
    for (const width of [40, 60, 88]) {
      expectWidth(await plain(null, width), width);
      expectWidth(await plain("home", width), width);
    }
  });
});

describe("renderHelp", () => {
  test("includes usage, sections, options, and keys", () => {
    const output = renderHelp("1.0.0", 88, false);

    expect(output).toContain("npx @vathsavv56/v56 [section] [options]");
    expect(output).toContain("bunx @vathsavv56/v56 [section] [options]");
    expect(output).toContain("▌ Sections");
    expect(output).toContain("▌ Options");
    expect(output).toContain("--plain");
    expect(output).toContain("--width N");
    expect(output).toContain("▌ Keys");
    expect(output).toContain("← →, 1–4");
    expect(output).toContain("v56 1.0.0");
    expect(output).not.toMatch(ANSI);
  });

  test("does not list the removed resume section", () => {
    const output = renderHelp("1.0.0", 88, false);

    expect(output).not.toContain("resume");
    expect(output).not.toContain("philosophy");
  });

  test("keeps all lines within the requested width", () => {
    for (const width of [40, 60, 88]) {
      expectWidth(renderHelp("1.0.0", width, false), width);
    }
  });

  test("helpBlocks lay out within a narrow width", () => {
    const lines = layoutBlocks(helpBlocks(), 38);

    expect(Math.max(...lines.map((line) => textLine(line).length))).toBeLessThanOrEqual(
      38,
    );
  });
});

describe("renderVersion", () => {
  test("prints a single version line", () => {
    expect(renderVersion("1.2.3")).toBe("v56 1.2.3\n");
  });
});
