import {
  ABOUT,
  CONTACT_LINKS,
  INSPIRATIONS,
  PHILOSOPHY,
  PROFILE,
  PROJECTS,
  WRITING_ENTRIES,
  type Project,
  type WritingEntry,
} from "../data/portfolio";
import { span, type DocBlock, type Span } from "../lib/document";
import { markdownToBlocks } from "../lib/markdown";

function highlight(text: string, phrase: string): Span[] {
  const index = text.indexOf(phrase);
  if (index === -1) return [span(text)];

  return [
    span(text.slice(0, index)),
    span(phrase, { bold: true, underline: true, color: "accent" }),
    span(text.slice(index + phrase.length)),
  ];
}

function joinList(items: readonly string[], separator = " · "): Span[] {
  const spans: Span[] = [];
  items.forEach((item, index) => {
    if (index > 0) spans.push(span(separator, { dim: true }));
    spans.push(span(item));
  });
  return spans;
}

export function homeBlocks(interactive = true, includeIdentity = true): DocBlock[] {
  const blocks: DocBlock[] = [];

  if (includeIdentity) {
    blocks.push(
      {
        type: "paragraph",
        spans: [span(PROFILE.traits.join("  ·  "), { bold: true })],
      },
      {
        type: "paragraph",
        spans: [
          span(PROFILE.location, { dim: true }),
          span("  ·  ", { dim: true }),
          span(PROFILE.availability, { dim: true }),
        ],
      },
    );
  }

  blocks.push(
    { type: "heading", text: "About Me", gapBefore: includeIdentity ? 1 : 0 },
    {
      type: "paragraph",
      spans: [
        span(ABOUT.lead),
        span(" "),
        ...highlight(ABOUT.values, ABOUT.highlight),
        span(" "),
        span(ABOUT.close),
      ],
    },
    {
      type: "paragraph",
      spans: interactive
        ? [
            span("→ ", { dim: true }),
            span("Why NPC isn't an option", { italic: true }),
            span("  ·  press 3", { dim: true }),
          ]
        : [
            span("→ ", { dim: true }),
            span("Why NPC isn't an option", { italic: true }),
            span(`  ·  ${PROFILE.links.philosophy}`, { dim: true, underline: true }),
          ],
      gapBefore: 1,
    },
    { type: "heading", text: "Featured Projects", gapBefore: 1 },
  );

  for (const [index, project] of PROJECTS.filter((item) => item.featured).entries()) {
    blocks.push({
      type: "paragraph",
      spans: [
        span(String(index + 1).padStart(2, "0"), { dim: true }),
        span("  "),
        span(project.name, { bold: true }),
        span("  ·  ", { dim: true }),
        span(project.tags.slice(0, 3).join(", "), { dim: true }),
      ],
    });
  }

  blocks.push(
    {
      type: "paragraph",
      spans: [
        span(
          interactive
            ? "→ press 2 for all projects"
            : "→ npx @vathsavv56/v56 projects for every project and link.",
          { dim: true },
        ),
      ],
      gapBefore: 1,
    },
    { type: "heading", text: "Now", gapBefore: 1 },
    {
      type: "paragraph",
      spans: [
        span("B.Tech CS at Vignan University '27", { bold: true }),
        span("  ·  ", { dim: true }),
        span(PROFILE.availability),
      ],
    },
    {
      type: "paragraph",
      spans: [
        span("Focus  ", { dim: true }),
        span("frontend engineering, UI component systems, and developer tools."),
      ],
    },
  );

  return blocks;
}

export function projectBlocks(project: Project, index: number): DocBlock[] {
  const links: DocBlock[] = [];
  if (project.demo) {
    links.push({
      type: "keyValue",
      key: "live",
      value: [span(project.demo, { underline: true, color: "accent" })],
    });
  }
  if (project.github) {
    links.push({
      type: "keyValue",
      key: "github",
      value: [span(project.github, { underline: true, color: "accent" })],
    });
  }
  if (links.length === 0) {
    links.push({
      type: "paragraph",
      spans: [span("No public link for this one yet.", { dim: true })],
    });
  }

  return [
    {
      type: "paragraph",
      spans: [
        span(`Project ${String(index + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}`, { dim: true }),
        span("  ·  ", { dim: true }),
        span(project.year, { dim: true }),
      ],
    },
    {
      type: "paragraph",
      spans: [
        span("▌ ", { color: "accent" }),
        span(project.name, { bold: true }),
      ],
      gapBefore: 0,
    },
    {
      type: "paragraph",
      spans: [span(project.subtitle, { dim: true })],
    },
    { type: "paragraph", spans: [span(project.description)], gapBefore: 1 },
    { type: "heading", text: "Highlights", gapBefore: 1 },
    ...project.highlights.map(
      (item): DocBlock => ({ type: "bullet", spans: [span(item)] }),
    ),
    { type: "heading", text: "Stack", gapBefore: 1 },
    { type: "paragraph", spans: [span(project.tags.join(" · "))] },
    { type: "heading", text: "Links", gapBefore: 1 },
    ...links,
  ];
}

export function projectsBlocks(detailed: boolean): DocBlock[] {
  const blocks: DocBlock[] = [
    { type: "heading", text: "Projects" },
    {
      type: "paragraph",
      spans: [
        span(
          "A few small, useful products I've built and put in front of real people.",
          { dim: true },
        ),
      ],
    },
  ];

  PROJECTS.forEach((project, index) => {
    blocks.push(
      {
        type: "paragraph",
        spans: [
          span(String(index + 1).padStart(2, "0"), { dim: true }),
          span("  "),
          span(project.name, { bold: true }),
          span("  ·  ", { dim: true }),
          span(project.subtitle, { dim: true }),
        ],
        gapBefore: 1,
      },
      { type: "paragraph", spans: [span(project.description)] },
    );

    if (detailed) {
      blocks.push(
        ...project.highlights.map(
          (item): DocBlock => ({ type: "bullet", spans: [span(item)] }),
        ),
      );
    }

    blocks.push({
      type: "keyValue",
      key: "stack",
      value: [span(project.tags.join(" · "))],
      gapBefore: 1,
    });

    if (project.demo) {
      blocks.push({
        type: "keyValue",
        key: "live",
        value: [span(project.demo, { underline: true })],
      });
    }
    if (project.github) {
      blocks.push({
        type: "keyValue",
        key: "github",
        value: [span(project.github, { underline: true })],
      });
    }
  });

  return blocks;
}

export function postHeaderBlocks(entry: WritingEntry): DocBlock[] {
  const source =
    entry.kind === "post"
      ? "Fetched live from the portfolio's blog source."
      : "An essay from the portfolio.";

  return [
    { type: "title", spans: [span("▌ ", { color: "accent" }), span(entry.title, { bold: true })] },
    {
      type: "paragraph",
      spans: [
        span(entry.meta, { dim: true }),
        span("  ·  ", { dim: true }),
        span(entry.tags.join(" · "), { dim: true }),
      ],
    },
    { type: "paragraph", spans: [span(entry.summary)] },
    {
      type: "paragraph",
      spans: [
        span(source, { italic: true }),
        span(
          entry.kind === "post"
            ? " Press o to open the original."
            : " Press o to read it on the site.",
          { dim: true },
        ),
      ],
      gapBefore: 1,
    },
  ];
}

export function postBlocks(entry: WritingEntry, markdown: string): DocBlock[] {
  return [
    ...postHeaderBlocks(entry),
    { type: "divider", gapBefore: 1 },
    ...markdownToBlocks(markdown, { skipFirstHeading: true }),
  ];
}

export function postUnavailableBlocks(
  entry: WritingEntry,
  reason: string,
): DocBlock[] {
  return [
    ...postHeaderBlocks(entry),
    { type: "paragraph", spans: [span(reason, { dim: true })], gapBefore: 1 },
    {
      type: "keyValue",
      key: "read online",
      value: [span(entry.url, { underline: true, color: "accent" })],
      gapBefore: 1,
    },
  ];
}

export function writingBlocks(): DocBlock[] {
  const blocks: DocBlock[] = [
    { type: "heading", text: "Writing" },
    {
      type: "paragraph",
      spans: [
        span(
          "Blog posts on software, plus a longer essay on living fully.",
          { dim: true },
        ),
      ],
    },
  ];

  for (const entry of WRITING_ENTRIES) {
    blocks.push(
      {
        type: "paragraph",
        spans: [span(entry.title, { bold: true })],
        gapBefore: 1,
      },
      {
        type: "paragraph",
        spans: [
          span(entry.kind === "post" ? "blog post" : "essay", { dim: true }),
          span("  ·  ", { dim: true }),
          span(entry.meta, { dim: true }),
        ],
      },
      { type: "paragraph", spans: [span(entry.summary)] },
      {
        type: "keyValue",
        key: "read",
        value: [span(entry.url, { underline: true, color: "accent" })],
      },
    );
  }

  return blocks;
}

export function philosophyBlocks(): DocBlock[] {
  const blocks: DocBlock[] = [
    { type: "title", spans: [span("▌ ", { color: "accent" }), span(PHILOSOPHY.title, { bold: true })] },
    { type: "paragraph", spans: [span(PHILOSOPHY.intro, { dim: true })] },
    { type: "heading", text: "People who refuse to give up", gapBefore: 1 },
  ];

  for (const inspiration of INSPIRATIONS) {
    blocks.push({
      type: "paragraph",
      spans: [
        span(inspiration.name, { bold: true }),
        span(`  ·  ${inspiration.source}`, { dim: true }),
      ],
    });
  }

  blocks.push(
    { type: "paragraph", spans: [span(PHILOSOPHY.paragraphs[0] ?? "")] },
    { type: "paragraph", spans: [span(PHILOSOPHY.paragraphs[1] ?? "")], gapBefore: 1 },
    { type: "paragraph", spans: [span(PHILOSOPHY.paragraphs[2] ?? "")], gapBefore: 1 },
    { type: "heading", text: "By the numbers", gapBefore: 1 },
    { type: "paragraph", spans: [span("If you want it in numbers, here they are:")] },
  );

  for (const stat of PHILOSOPHY.stats) {
    blocks.push({
      type: "paragraph",
      spans: [
        span(stat.value, { bold: true }),
        span(`  ${stat.label}`, { dim: true }),
      ],
    });
  }

  blocks.push(
    { type: "paragraph", spans: [span(PHILOSOPHY.paragraphs[3] ?? "")], gapBefore: 1 },
    { type: "heading", text: "Nothing is permanent", gapBefore: 1 },
    { type: "paragraph", spans: [span(PHILOSOPHY.paragraphs[4] ?? "")] },
    { type: "paragraph", spans: [span(PHILOSOPHY.paragraphs[5] ?? "")], gapBefore: 1 },
    { type: "paragraph", spans: [span(PHILOSOPHY.paragraphs[6] ?? "")], gapBefore: 1 },
    { type: "paragraph", spans: [span(PHILOSOPHY.closing, { italic: true })], gapBefore: 1 },
    {
      type: "keyValue",
      key: "email",
      value: [span(PROFILE.email, { underline: true, color: "accent" })],
      gapBefore: 1,
    },
    {
      type: "keyValue",
      key: "web",
      value: [span(PROFILE.links.philosophy, { underline: true, color: "accent" })],
    },
  );

  return blocks;
}

export function contactBlocks(): DocBlock[] {
  const blocks: DocBlock[] = [
    { type: "heading", text: "Contact" },
    {
      type: "paragraph",
      spans: [
        span(PROFILE.availability, { bold: true }),
        span("  ·  ", { dim: true }),
        span(PROFILE.location),
      ],
    },
    {
      type: "paragraph",
      spans: [
        span(
          "The fastest way to reach me is email. For anything public, pick a link below.",
          { dim: true },
        ),
      ],
    },
  ];

  for (const link of CONTACT_LINKS) {
    blocks.push({
      type: "keyValue",
      key: link.label,
      value: [
        span(link.value, { color: "accent" }),
        span(`  —  ${link.description}`, { dim: true }),
      ],
      gapBefore: 1,
    });
  }

  blocks.push(
    { type: "heading", text: "Also worth knowing", gapBefore: 1 },
    {
      type: "paragraph",
      spans: [
        span("I'm a student, not an agency. ", { dim: true }),
        span(
          "The best way to see what I can do is to look at the projects and the code.",
        ),
      ],
    },
    {
      type: "paragraph",
      spans: [
        span("Interests  ", { dim: true }),
        ...joinList([
          "polished interfaces",
          "developer tools",
          "first principles",
          "anime",
          "intentional living",
        ]),
      ],
    },
  );

  return blocks;
}
