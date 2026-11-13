import { describe, expect, test } from "bun:test";
import {
  layoutBlocks,
  paginateLines,
  plainLine,
  span,
  textLine,
  visibleWidth,
  wrapSpans,
  type Line,
} from "../src/lib/document";

function strings(lines: Line[]): string[] {
  return lines.map((line) => textLine(line));
}

function widths(lines: Line[]): number[] {
  return lines.map((line) => visibleWidth(textLine(line)));
}

describe("wrapSpans", () => {
  test("keeps punctuation attached when it follows a styled span", () => {
    const lines = wrapSpans(
      [span("nothing is permanent, and every moment counts", { bold: true }), span(".")],
      80,
    );

    expect(strings(lines)).toEqual([
      "nothing is permanent, and every moment counts.",
    ]);
  });

  test("preserves spaces between separate spans", () => {
    const lines = wrapSpans([span("hello"), span(" "), span("world")], 80);

    expect(strings(lines)).toEqual(["hello world"]);
  });

  test("wraps on word boundaries", () => {
    const lines = wrapSpans([span("one two three")], 7);

    expect(strings(lines)).toEqual(["one two", "three"]);
  });

  test("hard-breaks long words such as URLs", () => {
    const lines = wrapSpans([span("https://example.com/very/long")], 10);

    expect(strings(lines)).toEqual(["https://ex", "ample.com/", "very/long"]);
    expect(Math.max(...widths(lines))).toBeLessThanOrEqual(10);
  });

  test("uses a hanging prefix for bullets", () => {
    const lines = layoutBlocks(
      [{ type: "bullet", spans: [span("one two three four")] }],
      10,
    );

    expect(lines[0]?.[0]?.text).toBe("• ");
    expect(strings(lines).slice(1).every((line) => line.startsWith("  "))).toBe(
      true,
    );
    expect(Math.max(...widths(lines))).toBeLessThanOrEqual(10);
  });
});

describe("layoutBlocks", () => {
  test("prefixes headings with an accent marker", () => {
    const lines = layoutBlocks([{ type: "heading", text: "About Me" }], 40);

    expect(strings(lines)).toEqual(["▌ About Me"]);
  });

  test("puts a blank line after headings before content", () => {
    const lines = layoutBlocks(
      [
        { type: "heading", text: "Section" },
        { type: "paragraph", spans: [span("content")] },
        { type: "heading", text: "Next" },
      ],
      40,
    );

    expect(strings(lines)).toEqual(["▌ Section", "", "content", "", "▌ Next"]);
  });

  test("keeps inline key/value labels separated from the value", () => {
    const lines = layoutBlocks(
      [
        {
          type: "keyValue",
          key: "Live",
          value: [span("https://example.com")],
        },
      ],
      50,
    );

    expect(strings(lines)[0]).toStartWith("Live  https://example.com");
  });

  test("stacks a long key above its value instead of joining them", () => {
    const lines = layoutBlocks(
      [
        {
          type: "keyValue",
          key: "PowerSync on the origins",
          value: [span("https://powersync.com/blog")],
        },
      ],
      60,
    );
    const output = strings(lines);

    expect(output[0]).toBe("PowerSync on the origins");
    expect(output[1]).toStartWith("  https://powersync.com/blog");
    expect(Math.max(...widths(lines))).toBeLessThanOrEqual(60);
  });

  test("wraps a long key on narrow terminals", () => {
    const lines = layoutBlocks(
      [
        {
          type: "keyValue",
          key: "A very long reference label",
          value: [span("https://example.com")],
        },
      ],
      20,
    );

    expect(Math.max(...widths(lines))).toBeLessThanOrEqual(20);
  });

  test("builds dividers at the requested width", () => {
    const lines = layoutBlocks([{ type: "divider" }], 12);

    expect(strings(lines)).toEqual(["─".repeat(12)]);
  });

  test("drops trailing blank lines", () => {
    const lines = layoutBlocks(
      [
        { type: "paragraph", spans: [span("hello")] },
        { type: "spacer", lines: 3 },
      ],
      40,
    );

    expect(strings(lines)).toEqual(["hello"]);
  });
});

describe("paginateLines", () => {
  const line = (text: string): Line => [span(text)];

  test("splits into pages and trims blank edges", () => {
    const pages = paginateLines(
      [line("A"), line("B"), [], line("C"), line("D"), line("E")],
      3,
    );

    expect(pages.map(strings)).toEqual([
      ["A", "B"],
      ["C", "D", "E"],
    ]);
  });

  test("never starts or ends a page on a blank line", () => {
    const pages = paginateLines(
      [[], line("A"), [], line("B"), [], line("C"), []],
      2,
    );

    for (const page of pages) {
      expect(textLine(page[0]!)).not.toBe("");
      expect(textLine(page[page.length - 1]!)).not.toBe("");
    }
  });

  test("returns one empty page for empty input", () => {
    expect(paginateLines([], 10)).toEqual([[]]);
  });
});

describe("plainLine", () => {
  test("omits ANSI when color is disabled", () => {
    expect(plainLine([span("hello", { bold: true })], false)).toBe("hello");
  });

  test("adds ANSI when color is enabled", () => {
    expect(plainLine([span("hello", { bold: true })], true)).toBe(
      "\u001B[1mhello\u001B[0m",
    );
  });

  test("colors spans when enabled", () => {
    expect(plainLine([span("hi", { color: "accent" })], true)).toBe(
      "\u001B[38;5;117mhi\u001B[0m",
    );
    expect(plainLine([span("hi", { color: "accent" })], false)).toBe("hi");
  });
});
