import {
  SECTIONS,
  PROFILE,
  WRITING_ENTRIES,
  type SectionId,
  type WritingEntry,
} from "../data/portfolio";
import {
  contactBlocks,
  homeBlocks,
  philosophyBlocks,
  postBlocks,
  postUnavailableBlocks,
  projectsBlocks,
  writingBlocks,
} from "../content/blocks";
import { fetchBlogMarkdown } from "./blog";
import {
  layoutBlocks,
  plainLine,
  ruleSpans,
  span,
  type DocBlock,
  type Line,
} from "./document";
import { v56MarkLines } from "./pixel";

const INDENT = "  ";

export type PostMarkdownFetcher = (slug: string) => Promise<string>;

export interface PlainRenderOptions {
  section: SectionId | null;
  width: number;
  color: boolean;
  fetchPostMarkdown?: PostMarkdownFetcher;
}

function renderLines(lines: Line[], color: boolean): string[] {
  return lines.map((line) => {
    const text = plainLine(line, color);
    return text.length > 0 ? `${INDENT}${text}` : "";
  });
}

function renderBlocks(blocks: DocBlock[], width: number, color: boolean): string[] {
  const contentWidth = Math.max(24, width - INDENT.length);
  return renderLines(layoutBlocks(blocks, contentWidth), color);
}

function divider(width: number, color: boolean): string {
  return `${INDENT}${plainLine(ruleSpans(Math.max(10, width - INDENT.length)), color)}`;
}

function masthead(width: number, color: boolean): string[] {
  const contentWidth = Math.max(24, width - INDENT.length);
  const mark = v56MarkLines();
  const body = layoutBlocks(
    [
      {
        type: "paragraph",
        spans: [span(PROFILE.name, { bold: true })],
      },
      {
        type: "paragraph",
        spans: [
          span("● ", { color: "positive" }),
          span(PROFILE.availability, { bold: true }),
        ],
      },
      {
        type: "paragraph",
        spans: [
          span(PROFILE.traits.join("  ·  "), { dim: true }),
          span("  ·  ", { dim: true }),
          span(PROFILE.location, { dim: true }),
        ],
      },
    ],
    contentWidth,
  );

  return [
    ...renderLines(mark, color),
    "",
    ...renderLines(body, color),
  ];
}

function footer(width: number, color: boolean, interactiveHint: boolean): string[] {
  const command = (label: string, description: string): string[] =>
    renderBlocks(
      [
        {
          type: "paragraph",
          spans: [span(label, { bold: true }), span(`  →  ${description}`, { dim: true })],
        },
      ],
      width,
      color,
    );

  return [
    "",
    divider(width, color),
    `${INDENT}${plainLine([span("Jai Sri Ram", { dim: true })], color)}`,
    "",
    ...command("npx @vathsavv56/v56", "the interactive terminal portfolio"),
    ...command("npx @vathsavv56/v56 --help", "every command and key"),
    ...(interactiveHint
      ? [
          "",
          ...renderBlocks(
            [
              {
                type: "paragraph",
                spans: [
                  span("Tip: run it in an interactive terminal for the full effect.", {
                    dim: true,
                  }),
                ],
              },
            ],
            width,
            color,
          ),
        ]
      : []),
  ];
}

async function writingDetail(
  entry: WritingEntry,
  width: number,
  color: boolean,
  fetcher: PostMarkdownFetcher,
): Promise<string[]> {
  if (entry.kind === "essay") {
    return renderBlocks(philosophyBlocks(), width, color);
  }

  if (!entry.slug) {
    return renderBlocks(
      postUnavailableBlocks(entry, "No source link for this post."),
      width,
      color,
    );
  }

  try {
    const markdown = await fetcher(entry.slug);
    return renderBlocks(postBlocks(entry, markdown), width, color);
  } catch {
    return renderBlocks(
      postUnavailableBlocks(
        entry,
        "The post could not be fetched. Check your connection and read it online.",
      ),
      width,
      color,
    );
  }
}

async function sectionContent(
  section: SectionId,
  color: boolean,
  width: number,
  fetcher: PostMarkdownFetcher,
): Promise<string[]> {
  switch (section) {
    case "home":
      return renderBlocks(homeBlocks(false, false), width, color);
    case "projects":
      return renderBlocks(projectsBlocks(true), width, color);
    case "writing": {
      const lines = renderBlocks(writingBlocks(), width, color);
      for (const entry of WRITING_ENTRIES) {
        lines.push(
          "",
          ...(await writingDetail(entry, width, color, fetcher)),
        );
      }
      return lines;
    }
    case "contact":
      return renderBlocks(contactBlocks(), width, color);
  }
}

export async function renderPlain(options: PlainRenderOptions): Promise<string> {
  const { section, width, color } = options;
  const fetcher =
    options.fetchPostMarkdown ?? ((slug: string) => fetchBlogMarkdown(slug));
  const lines: string[] = [...masthead(width, color), "", divider(width, color), ""];

  if (section === null) {
    for (const [index, item] of SECTIONS.entries()) {
      if (index > 0) lines.push("");
      lines.push(...(await sectionContent(item.id, color, width, fetcher)));
    }
  } else {
    lines.push(...(await sectionContent(section, color, width, fetcher)));
  }

  lines.push(...footer(width, color, !process.stdout.isTTY));
  return `${lines.join("\n")}\n`;
}

export function helpBlocks(): DocBlock[] {
  const blocks: DocBlock[] = [
    { type: "heading", text: "Usage" },
    {
      type: "paragraph",
      spans: [span("npx @vathsavv56/v56 [section] [options]")],
    },
    {
      type: "paragraph",
      spans: [span("bunx @vathsavv56/v56 [section] [options]", { dim: true })],
    },
    { type: "heading", text: "Sections", gapBefore: 1 },
  ];

  for (const section of SECTIONS) {
    blocks.push({
      type: "keyValue",
      key: section.label,
      keyWidth: 12,
      value: [span(section.description, { dim: true })],
    });
  }

  blocks.push(
    { type: "heading", text: "Options", gapBefore: 1 },
    {
      type: "keyValue",
      key: "--plain",
      keyWidth: 15,
      value: [span("Print the portfolio without the interactive UI", { dim: true })],
    },
    {
      type: "keyValue",
      key: "--width N",
      keyWidth: 15,
      value: [span("Wrap plain output at N columns (40–200)", { dim: true })],
    },
    {
      type: "keyValue",
      key: "--no-color",
      keyWidth: 15,
      value: [span("Disable ANSI color", { dim: true })],
    },
    {
      type: "keyValue",
      key: "-h, --help",
      keyWidth: 15,
      value: [span("Show this help", { dim: true })],
    },
    {
      type: "keyValue",
      key: "-v, --version",
      keyWidth: 15,
      value: [span("Print the version", { dim: true })],
    },
    { type: "heading", text: "Keys", gapBefore: 1 },
    {
      type: "keyValue",
      key: "← →, 1–4",
      keyWidth: 12,
      value: [span("Change section", { dim: true })],
    },
    {
      type: "keyValue",
      key: "↑ ↓, j k",
      keyWidth: 12,
      value: [span("Move selection or turn the page", { dim: true })],
    },
    {
      type: "keyValue",
      key: "enter",
      keyWidth: 12,
      value: [span("Open the selected item or its details", { dim: true })],
    },
    {
      type: "keyValue",
      key: "o",
      keyWidth: 12,
      value: [span("Open the relevant link in your browser", { dim: true })],
    },
    {
      type: "keyValue",
      key: "g",
      keyWidth: 12,
      value: [span("Open GitHub", { dim: true })],
    },
    {
      type: "keyValue",
      key: "e",
      keyWidth: 12,
      value: [span("Compose an email", { dim: true })],
    },
    {
      type: "keyValue",
      key: "esc",
      keyWidth: 12,
      value: [span("Go back", { dim: true })],
    },
    {
      type: "keyValue",
      key: "?",
      keyWidth: 12,
      value: [span("Toggle help", { dim: true })],
    },
    {
      type: "keyValue",
      key: "q",
      keyWidth: 12,
      value: [span("Quit", { dim: true })],
    },
    { type: "heading", text: "Examples", gapBefore: 1 },
    { type: "paragraph", spans: [span("npx @vathsavv56/v56")] },
    { type: "paragraph", spans: [span("npx @vathsavv56/v56 projects")] },
    { type: "paragraph", spans: [span("npx @vathsavv56/v56 writing --plain")] },
    { type: "paragraph", spans: [span("npx @vathsavv56/v56 --plain > portfolio.txt")] },
  );

  return blocks;
}

export function renderHelp(version: string, width: number, color: boolean): string {
  const lines: string[] = [
    ...masthead(width, color),
    "",
    ...renderBlocks(helpBlocks(), width, color),
    "",
    divider(width, color),
    ...renderBlocks(
      [
        {
          type: "paragraph",
          spans: [
            span(`v56 ${version}`, { dim: true }),
            span("  ·  ", { dim: true }),
            span(PROFILE.links.portfolio, { dim: true }),
          ],
        },
      ],
      width,
      color,
    ),
    "",
  ];

  return `${lines.join("\n")}\n`;
}

export function renderVersion(version: string): string {
  return `v56 ${version}\n`;
}
