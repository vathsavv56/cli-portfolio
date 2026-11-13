import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import { cleanup, render } from "ink-testing-library";
import { App } from "../src/app/App";
import { clearBlogCache } from "../src/lib/blog";

const ANSI = /\u001B\[[0-9;]*m/gu;
const originalFetch = globalThis.fetch;

const SAMPLE_MARKDOWN = [
  "# Local First Software",
  "",
  "Fetched in tests.",
  "",
  ...Array.from(
    { length: 24 },
    (_, index) =>
      `Paragraph ${index + 1}: this content comes from the mocked blog source and is long enough to fill several terminal pages.`,
  ),
  "",
  "## The final heading",
  "",
  "The end.",
].join("\n");

type Instance = ReturnType<typeof render>;

const instances: Instance[] = [];

function mount(columns: number, rows: number): Instance {
  const instance = render(
    <App sizeOverride={{ columns, rows }} initialSection="home" />,
  );
  instances.push(instance);
  return instance;
}

function frame(instance: Instance): string {
  return (instance.lastFrame() ?? "").replace(ANSI, "");
}

async function press(instance: Instance, key: string): Promise<string> {
  instance.stdin.write(key);
  await Bun.sleep(100);
  return frame(instance);
}

beforeAll(() => {
  globalThis.fetch = (async () =>
    new Response(SAMPLE_MARKDOWN, { status: 200 })) as unknown as typeof fetch;
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

afterEach(() => {
  for (const instance of instances.splice(0)) {
    instance.unmount();
  }
  cleanup();
  clearBlogCache();
});

describe("App", () => {
  test("renders the home screen and navigates sections", async () => {
    const app = mount(100, 30);
    await Bun.sleep(120);

    const home = frame(app);
    expect(home).toContain("Vathsav Inavolu");
    expect(home).toContain("terminal portfolio");
    expect(home).toContain("Open to software engineering internships");
    expect(home).toContain("▌ About");
    expect(home).toContain("kernUI-v2");
    expect(home).toContain("Jai Sri Ram");

    const projects = await press(app, "2");
    expect(projects).toContain("▌ Projects");
    expect(projects).toContain("kernUI-v2");
    expect(projects).toContain("kern-v2-alpha.vercel.app");

    const help = await press(app, "?");
    expect(help).toContain("▌ Usage");
    expect(help).toContain("npx @vathsavv56/v56 [section] [options]");

    const backToProjects = await press(app, "\u001B");
    expect(backToProjects).not.toContain("▌ Usage");
    expect(backToProjects).toContain("▌ Projects");

    const backHome = await press(app, "\u001B");
    expect(backHome).toContain("▌ About");
  });

  test("lists the blog and essay together, then fetches a post", async () => {
    const app = mount(100, 30);
    await Bun.sleep(120);

    const writing = await press(app, "3");
    expect(writing).toContain("▌ Writing");
    expect(writing).toContain("Local First Software");
    expect(writing).toContain("On Living Fully");

    const post = await press(app, "\r");
    expect(post).toContain("Local First Software");
    expect(post).toContain("Fetched in tests.");

    const secondPage = await press(app, "\u001B[B");
    expect(secondPage).toContain("page 2/");
  });

  test("opens the philosophy essay without fetching", async () => {
    const app = mount(100, 30);
    await Bun.sleep(120);

    await press(app, "3");
    const essay = await press(app, "\u001B[B");
    const opened = await press(app, "\r");

    expect(essay).toContain("On Living Fully");
    expect(opened).toContain("▌ People who refuse to give up");
    expect(opened).toContain("page 1/3");
  });

  test("adapts the chrome to a narrow terminal", async () => {
    const app = mount(60, 24);
    await Bun.sleep(120);
    const screen = frame(app);

    expect(screen).toContain("work");
    expect(screen).toContain("writing");
    expect(screen.split("\n")[0]).not.toContain("Guntur, India");

    const long = screen
      .split("\n")
      .map((line) => line.replace(/\s+$/u, ""))
      .filter((line) => Array.from(line).length > 60);
    expect(long).toEqual([]);
  });
});
