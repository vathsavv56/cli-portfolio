import { span, type DocBlock, type Span, type SpanStyle } from "./document";

const INLINE_RE =
  /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|<(https?:\/\/[^>]+)>/gu;

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  nbsp: " ",
};

function decodeEntities(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#39|nbsp);/gu, (_, name: string) => {
    return ENTITIES[name] ?? `&${name};`;
  });
}

function pushText(spans: Span[], text: string, style: SpanStyle = {}): void {
  const decoded = decodeEntities(text);
  if (decoded.length > 0) spans.push(span(decoded, style));
}

/**
 * Convert a small, practical subset of Markdown into terminal blocks:
 * headings, paragraphs, bullet lists, quotes, rules, and fenced code.
 * Inline bold, italics, code, links, images, and autolinks are supported.
 */
export function inlineSpans(text: string): Span[] {
  const spans: Span[] = [];
  let last = 0;

  for (const match of text.matchAll(INLINE_RE)) {
    const index = match.index ?? 0;
    if (index > last) pushText(spans, text.slice(last, index));

    const [
      full,
      imageAlt,
      _imageUrl,
      linkLabel,
      linkUrl,
      code,
      boldStars,
      boldUnderscores,
      italicStars,
      italicUnderscores,
      autolink,
    ] = match;

    if (imageAlt !== undefined) {
      pushText(spans, imageAlt ? `[image: ${imageAlt}]` : "[image]", {
        dim: true,
      });
    } else if (linkLabel !== undefined && linkUrl !== undefined) {
      pushText(spans, linkLabel, { underline: true });
      if (linkLabel !== linkUrl) pushText(spans, ` (${linkUrl})`, { dim: true });
    } else if (code !== undefined) {
      pushText(spans, `\`${code}\``, { dim: true });
    } else if (boldStars !== undefined || boldUnderscores !== undefined) {
      pushText(spans, boldStars ?? boldUnderscores ?? "", { bold: true });
    } else if (italicStars !== undefined || italicUnderscores !== undefined) {
      pushText(spans, italicStars ?? italicUnderscores ?? "", { italic: true });
    } else if (autolink !== undefined) {
      pushText(spans, autolink, { underline: true });
    }

    last = index + full.length;
  }

  if (last < text.length) pushText(spans, text.slice(last));
  return spans;
}

function stripInline(text: string): string {
  return decodeEntities(
    text
      .replace(/!\[([^\]]*)\]\([^)]+\)/gu, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
      .replace(/`([^`]+)`/gu, "$1")
      .replace(/\*\*([^*]+)\*\*/gu, "$1")
      .replace(/__([^_]+)__/gu, "$1")
      .replace(/\*([^*]+)\*/gu, "$1")
      .replace(/_([^_]+)_/gu, "$1"),
  )
    .replace(/\s+([:;,.!?])/gu, "$1")
    .trim();
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/u;
const FENCE_RE = /^(```+|~~~+)\s*(.*)$/u;
const BULLET_RE = /^\s*[-*+]\s+(.+)$/u;
const ORDERED_RE = /^\s*\d+[.)]\s+(.+)$/u;
const QUOTE_RE = /^\s*>\s?(.*)$/u;
const RULE_RE = /^\s*([-*_])(?:\s*\1){2,}\s*$/u;

function isBlockStart(line: string): boolean {
  return (
    line.trim().length === 0 ||
    HEADING_RE.test(line) ||
    FENCE_RE.test(line) ||
    BULLET_RE.test(line) ||
    ORDERED_RE.test(line) ||
    QUOTE_RE.test(line) ||
    RULE_RE.test(line)
  );
}

function paragraphGap(previous: DocBlock["type"] | null): number {
  return previous === null ||
    previous === "heading" ||
    previous === "title" ||
    previous === "divider"
    ? 0
    : 1;
}

export interface MarkdownOptions {
  /** Use when the post title is already rendered above the document. */
  skipFirstHeading?: boolean;
}

export function markdownToBlocks(
  markdown: string,
  options: MarkdownOptions = {},
): DocBlock[] {
  const lines = markdown.replace(/\r\n?/gu, "\n").split("\n");
  const blocks: DocBlock[] = [];
  let previous: DocBlock["type"] | null = null;
  let index = 0;
  let skippedFirstHeading = false;

  const add = (block: DocBlock): void => {
    blocks.push(block);
    previous = block.type;
  };

  while (index < lines.length) {
    const line = lines[index]!;
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      index++;
      continue;
    }

    const heading = HEADING_RE.exec(trimmed);
    if (heading) {
      const level = heading[1]!.length;
      const text = stripInline(heading[2] ?? "");

      if (level === 1 && options.skipFirstHeading && !skippedFirstHeading) {
        skippedFirstHeading = true;
        index++;
        continue;
      }

      if (text.length > 0) {
        if (level === 1) {
          add({
            type: "title",
            spans: [span(text, { bold: true })],
            gapBefore: previous === null ? 0 : 1,
          });
        } else {
          add({
            type: "heading",
            text,
            gapBefore: previous === null ? 0 : 1,
          });
        }
      }
      index++;
      continue;
    }

    const fence = FENCE_RE.exec(trimmed);
    if (fence) {
      const marker = fence[1]!;
      const info = fence[2] ?? "";
      const codeLines: string[] = [];
      index++;

      while (index < lines.length) {
        const candidate = lines[index]!;
        if (candidate.trim().startsWith(marker.slice(0, 3))) {
          index++;
          break;
        }
        codeLines.push(candidate);
        index++;
      }

      const isDiagram =
        /mermaid/iu.test(info) ||
        /^\s*(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|timeline|journey|gitGraph|quadrantChart|requirementDiagram|sankey|xychart|kanban|architecture|radar)\b/mu.test(
          codeLines.join("\n"),
        );

      if (isDiagram) {
        add({
          type: "paragraph",
          spans: [
            span("[diagram omitted in the terminal — open the full post online]", {
              dim: true,
            }),
          ],
          gapBefore: 1,
        });
        continue;
      }

      for (const codeLine of codeLines) {
        add({
          type: "paragraph",
          spans: [span(`  ${codeLine}`, { dim: true })],
          gapBefore: 0,
        });
      }
      continue;
    }

    if (RULE_RE.test(trimmed)) {
      add({ type: "divider", gapBefore: 1 });
      index++;
      continue;
    }

    if (BULLET_RE.test(line) || ORDERED_RE.test(line)) {
      const ordered = ORDERED_RE.test(line);
      let itemGap = paragraphGap(previous);
      let itemNumber = 1;

      while (index < lines.length) {
        const itemLine = lines[index]!;
        const item = ordered
          ? ORDERED_RE.exec(itemLine)
          : BULLET_RE.exec(itemLine);
        if (!item) break;

        add({
          type: "bullet",
          spans: ordered
            ? [span(`${itemNumber}. `, { dim: true }), ...inlineSpans(item[1] ?? "")]
            : inlineSpans(item[1] ?? ""),
          gapBefore: itemGap,
        });
        itemGap = 0;
        itemNumber++;
        index++;
      }
      continue;
    }

    if (QUOTE_RE.test(line)) {
      const quoteLines: string[] = [];

      while (index < lines.length) {
        const quote = QUOTE_RE.exec(lines[index]!);
        if (!quote) break;
        quoteLines.push(quote[1] ?? "");
        index++;
      }

      add({
        type: "quote",
        spans: inlineSpans(quoteLines.join(" ")),
        gapBefore: previous === null ? 0 : 1,
      });
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length && !isBlockStart(lines[index]!)) {
      paragraphLines.push(lines[index]!.trim());
      index++;
    }

    if (paragraphLines.length === 0) {
      index++;
      continue;
    }

    add({
      type: "paragraph",
      spans: inlineSpans(paragraphLines.join(" ")),
      gapBefore: paragraphGap(previous),
    });
  }

  return blocks;
}
