import type { ColorToken } from "./palette";
import { PALETTE } from "./palette";

/**
 * Ink-native color names, so spans can be rendered by both the Ink document
 * view and the ANSI plain renderer without a translation table.
 */
export type SpanColor = ColorToken;

export interface SpanStyle {
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  inverse?: boolean;
  color?: SpanColor;
}

export type Span = SpanStyle & { text: string };
export type Line = Span[];

export type DocBlock =
  | { type: "title"; spans: Span[]; gapBefore?: number }
  | { type: "heading"; text: string; gapBefore?: number }
  | { type: "paragraph"; spans: Span[]; gapBefore?: number }
  | { type: "quote"; spans: Span[]; gapBefore?: number }
  | { type: "bullet"; spans: Span[]; gapBefore?: number }
  | {
      type: "keyValue";
      key: string;
      value: Span[];
      keyWidth?: number;
      gapBefore?: number;
    }
  | { type: "divider"; gapBefore?: number }
  | { type: "spacer"; lines?: number };

export function span(text: string, style: SpanStyle = {}): Span {
  return { text, ...style };
}

export function visibleWidth(text: string): number {
  return Array.from(text).length;
}

function lineWidth(line: Line): number {
  let width = 0;
  for (const part of line) width += visibleWidth(part.text);
  return width;
}

function styleKey(style: SpanStyle): string {
  return [
    style.bold ? "b" : "",
    style.dim ? "d" : "",
    style.italic ? "i" : "",
    style.underline ? "u" : "",
    style.inverse ? "v" : "",
    style.color ?? "",
  ].join("");
}

function appendSpan(line: Line, text: string, style: SpanStyle): void {
  if (text.length === 0) return;
  const last = line[line.length - 1];
  if (last && styleKey(last) === styleKey(style)) {
    last.text += text;
    return;
  }
  // Spans are sometimes passed whole as style; write text last so a stray
  // `text` on the style object can never overwrite the sliced text.
  line.push({ ...style, text });
}

function trimLineEnd(line: Line): Line {
  const copy = line.map((part) => ({ ...part }));
  while (copy.length > 0) {
    const last = copy[copy.length - 1]!;
    last.text = last.text.replace(/\s+$/u, "");
    if (last.text.length > 0) break;
    copy.pop();
  }
  return copy;
}

interface Word {
  parts: Span[];
  width: number;
}

function appendPart(parts: Span[], text: string, style: SpanStyle): void {
  if (text.length === 0) return;
  const last = parts[parts.length - 1];
  if (last && styleKey(last) === styleKey(style)) {
    last.text += text;
    return;
  }
  // Spans are sometimes passed whole as style; write text last so a stray
  // `text` on the style object can never overwrite the sliced text.
  parts.push({ ...style, text });
}

/**
 * Build words that can span multiple styles. If two spans meet with no
 * whitespace between them (for example, a bold phrase followed by a plain
 * period), they stay part of the same word instead of gaining a stray space.
 */
function wordsFromSpans(spans: Span[]): Word[] {
  const words: Word[] = [];
  let current: Span[] | null = null;
  let afterWhitespace = true;

  const finish = () => {
    if (!current) return;
    const parts = current;
    const width = parts.reduce(
      (total, part) => total + visibleWidth(part.text),
      0,
    );
    if (width > 0) words.push({ parts, width });
    current = null;
  };

  for (const part of spans) {
    const { text, ...style } = part;
    const pieces = text.replace(/\r?\n/gu, " ").split(/(\s+)/u);

    for (const piece of pieces) {
      if (!piece) continue;

      if (/^\s+$/u.test(piece)) {
        finish();
        afterWhitespace = true;
        continue;
      }

      if (afterWhitespace || !current) {
        finish();
        current = [];
        afterWhitespace = false;
      }

      appendPart(current, piece, style);
    }
  }

  finish();
  return words;
}

function takeWord(word: Word, max: number): { taken: Span[]; rest: Word | null } {
  let remaining = max;
  const taken: Span[] = [];
  const rest: Span[] = [];
  let taking = true;

  for (const part of word.parts) {
    const chars = Array.from(part.text);

    if (!taking) {
      appendPart(rest, part.text, part);
      continue;
    }

    if (chars.length <= remaining) {
      appendPart(taken, part.text, part);
      remaining -= chars.length;
      if (remaining === 0) taking = false;
      continue;
    }

    appendPart(taken, chars.slice(0, remaining).join(""), part);
    appendPart(rest, chars.slice(remaining).join(""), part);
    remaining = 0;
    taking = false;
  }

  if (rest.length === 0) return { taken, rest: null };
  const restWord: Word = {
    parts: rest,
    width: rest.reduce((total, part) => total + visibleWidth(part.text), 0),
  };
  return { taken, rest: restWord };
}

/**
 * Wrap styled words without ever measuring ANSI escapes (there are none yet).
 * Long words such as URLs are hard-broken so a narrow terminal can never
 * overflow horizontally.
 */
export function wrapSpans(
  spans: Span[],
  width: number,
  firstPrefix: Span[] = [],
  nextPrefix: Span[] = firstPrefix,
): Line[] {
  if (width <= 0) return [];

  const words = wordsFromSpans(spans);
  const firstPrefixWidth = lineWidth(firstPrefix);
  const nextPrefixWidth = lineWidth(nextPrefix);
  const lines: Line[] = [];
  let current: Line = [];
  let currentWidth = 0;

  const isFirstLine = () => lines.length === 0;
  const contentLimit = () =>
    Math.max(1, width - (isFirstLine() ? firstPrefixWidth : nextPrefixWidth));

  const pushLine = () => {
    lines.push(current);
    current = [];
    currentWidth = 0;
  };

  const addWord = (word: Word) => {
    let remaining: Word | null = word;

    while (remaining) {
      const limit = contentLimit();

      if (current.length > 0) {
        const needed = 1 + remaining.width;
        if (currentWidth + needed <= limit) {
          appendSpan(current, " ", {});
          for (const part of remaining.parts) {
            appendSpan(current, part.text, part);
          }
          currentWidth += needed;
          return;
        }

        pushLine();
        continue;
      }

      if (remaining.width <= limit) {
        for (const part of remaining.parts) {
          appendSpan(current, part.text, part);
        }
        currentWidth = remaining.width;
        return;
      }

      // A word longer than the line: fill this line, then continue.
      const { taken, rest } = takeWord(remaining, Math.max(1, limit));
      for (const part of taken) {
        appendSpan(current, part.text, part);
      }
      currentWidth = taken.reduce(
        (total, part) => total + visibleWidth(part.text),
        0,
      );
      pushLine();
      remaining = rest;
    }
  };

  for (const word of words) {
    addWord(word);
  }

  if (current.length > 0 || lines.length === 0) {
    lines.push(current);
  }

  return lines.map((line, index) =>
    trimLineEnd([...(index === 0 ? firstPrefix : nextPrefix), ...line]),
  );
}

function defaultGap(type: DocBlock["type"], previous: DocBlock["type"] | null): number {
  if (previous === null) return 0;
  let gap: number;
  switch (type) {
    case "heading":
    case "title":
    case "divider":
    case "quote":
      gap = 1;
      break;
    case "paragraph":
    case "bullet":
    case "keyValue":
      gap = 0;
      break;
    case "spacer":
      gap = 0;
      break;
  }

  // Content that follows a section heading gets a blank line to breathe.
  if (previous === "heading" && type !== "heading" && type !== "title") {
    gap += 1;
  }

  return gap;
}

function pushGap(lines: Line[], gap: number): void {
  if (lines.length === 0) return;

  let trailing = 0;
  for (let index = lines.length - 1; index >= 0; index--) {
    if (lineWidth(lines[index]!) === 0) trailing++;
    else break;
  }

  for (let index = trailing; index < gap; index++) {
    lines.push([]);
  }
}

function layoutKeyValue(
  block: Extract<DocBlock, { type: "keyValue" }>,
  width: number,
): Line[] {
  const maxKeyWidth = Math.max(6, Math.min(18, Math.floor(width * 0.35)));
  const desiredKeyWidth = visibleWidth(block.key) + 2;
  const naturalWidth = Math.max(6, desiredKeyWidth);
  // An explicit keyWidth declares the alignment for a whole group of rows, so
  // it wins even when a single key runs longer — otherwise one long key would
  // break the column for every other row.
  const keyWidth = block.keyWidth ?? naturalWidth;
  const inline = desiredKeyWidth <= maxKeyWidth && width >= keyWidth + 12;

  if (!inline) {
    return [
      ...wrapSpans([span(block.key, { bold: true, color: "accent" })], width),
      ...wrapSpans(
        block.value,
        width,
        [span("  ", {})],
        [span("  ", {})],
      ),
    ];
  }

  return wrapSpans(
    block.value,
    width,
    [span(block.key.padEnd(keyWidth), { color: "accent" })],
    [span(" ".repeat(keyWidth), {})],
  );
}

/**
 * Turn semantic blocks into fixed-width lines. Because every line is already
 * wrapped, Ink never has to guess how tall a paragraph is.
 */
export function layoutBlocks(blocks: DocBlock[], width: number): Line[] {
  if (width <= 0) return [];

  const lines: Line[] = [];
  let previous: DocBlock["type"] | null = null;

  for (const block of blocks) {
    if (block.type === "spacer") {
      for (let index = 0; index < (block.lines ?? 1); index++) lines.push([]);
      previous = block.type;
      continue;
    }

    const gap = block.gapBefore ?? defaultGap(block.type, previous);
    pushGap(lines, gap);

    switch (block.type) {
      case "title": {
        lines.push(...wrapSpans(block.spans, width));
        break;
      }
      case "heading": {
        lines.push(
          ...wrapSpans(
            [span(block.text, { bold: true })],
            width,
            [span("▌ ", { color: "accent" })],
            [span("    ", {})],
          ),
        );
        break;
      }
      case "paragraph": {
        lines.push(...wrapSpans(block.spans, width));
        break;
      }
      case "quote": {
        lines.push(
          ...wrapSpans(
            block.spans,
            width,
            [span("│ ", { dim: true })],
            [span("│ ", { dim: true })],
          ),
        );
        break;
      }
      case "bullet": {
        lines.push(
          ...wrapSpans(
            block.spans,
            width,
            [span("• ", { color: "accent" })],
            [span("  ", {})],
          ),
        );
        break;
      }
      case "keyValue": {
        lines.push(...layoutKeyValue(block, width));
        break;
      }
      case "divider": {
        lines.push(ruleSpans(width));
        break;
      }
    }

    previous = block.type;
  }

  while (lines.length > 0 && lineWidth(lines[lines.length - 1]!) === 0) {
    lines.pop();
  }

  return lines;
}

export function isBlankLine(line: Line): boolean {
  return line.every((part) => part.text.trim().length === 0);
}

/**
 * Split lines into pages without starting or ending a page on a blank line.
 * A single paragraph taller than the page is still split cleanly by line.
 */
export function paginateLines(lines: Line[], pageSize: number): Line[][] {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const pages: Line[][] = [];
  let start = 0;

  while (start < lines.length) {
    while (start < lines.length && isBlankLine(lines[start]!)) start++;
    if (start >= lines.length) break;

    const end = Math.min(lines.length, start + safePageSize);
    let contentEnd = end;
    while (contentEnd > start && isBlankLine(lines[contentEnd - 1]!)) {
      contentEnd--;
    }

    pages.push(lines.slice(start, contentEnd));
    start = end;
  }

  return pages.length > 0 ? pages : [[]];
}

const ANSI_CODES: Record<keyof SpanStyle, string | undefined> = {
  bold: "1",
  dim: "2",
  italic: "3",
  underline: "4",
  inverse: "7",
  color: undefined,
};

/**
 * A horizontal rule that dissolves into the background: solid frame gray for
 * the first stretch, then two dimmer steps so the line fades out instead of
 * stopping hard. Used by dividers, the plain masthead, and the TUI chrome.
 */
export function ruleSpans(width: number): Line {
  const total = Math.max(1, width);
  const head = Math.round(total * 0.6);
  const mid = Math.round((total - head) * 0.5);

  return [
    { text: "─".repeat(head), color: "frame" },
    { text: "─".repeat(mid), color: "frameSoft" },
    { text: "─".repeat(total - head - mid), color: "frameDeep" },
  ];
}

function ansiPrefix(style: SpanStyle): string {
  const codes: string[] = [];
  for (const key of Object.keys(ANSI_CODES) as Array<keyof SpanStyle>) {
    const code = ANSI_CODES[key];
    if (code && style[key]) codes.push(code);
  }
  if (style.color) codes.push(PALETTE[style.color].ansi);
  return codes.length > 0 ? `\u001B[${codes.join(";")}m` : "";
}

export function plainLine(line: Line, color: boolean): string {
  if (!color) return line.map((part) => part.text).join("");

  return line
    .map((part) => {
      const prefix = ansiPrefix(part);
      return prefix ? `${prefix}${part.text}\u001B[0m` : part.text;
    })
    .join("");
}

export function textLine(line: Line): string {
  return line.map((part) => part.text).join("");
}
