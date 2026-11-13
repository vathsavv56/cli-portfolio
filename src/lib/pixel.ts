/**
 * Tiny half-block pixel renderer for the v56 brand mark.
 *
 * Glyphs are 5×6 pixel bitmaps. Adjacent pixel rows are packed two-high into
 * half-block characters (▀ top only, ▄ bottom only, █ both), so a 6-row glyph
 * becomes 3 terminal lines at double the vertical resolution.
 *
 * The output is plain engine Lines, so the mark renders identically in the
 * interactive TUI and in `--plain` ANSI output.
 */
import type { Line } from "./document";
import type { ColorToken } from "./palette";

const GLYPH_ROWS = 6;
const GLYPH_COLS = 5;

const GLYPHS: Record<string, string[]> = {
  v: ["10001", "10001", "10001", "01010", "01010", "00100"],
  "5": ["11111", "10000", "10000", "11110", "00001", "11110"],
  "6": ["01110", "10001", "10000", "11110", "10001", "01110"],
};

interface Pixel {
  char: "▀" | "▄" | "█" | " ";
  color: ColorToken;
}

/** One vertical strip of half-block pixels (one terminal column). */
type Column = Pixel[];

function glyphColumns(glyph: string[], color: ColorToken): Column[] {
  const columns: Column[] = [];

  for (let col = 0; col < GLYPH_COLS; col++) {
    const column: Column = [];
    for (let row = 0; row < GLYPH_ROWS; row += 2) {
      const top = glyph[row]?.[col] === "1";
      const bottom = glyph[row + 1]?.[col] === "1";
      column.push({
        char: top && bottom ? "█" : top ? "▀" : bottom ? "▄" : " ",
        color,
      });
    }
    columns.push(column);
  }

  return columns;
}

function gapColumns(): Column[] {
  return Array.from({ length: 2 }, () =>
    Array.from({ length: Math.ceil(GLYPH_ROWS / 2) }, () => ({
      char: " " as const,
      color: "accent" as ColorToken,
    })),
  );
}

export interface PixelMarkOptions {
  /** Color per glyph, keyed by the glyph character. */
  colors?: Partial<Record<string, ColorToken>>;
  /** Fallback color for glyphs without an explicit color. */
  color?: ColorToken;
}

/**
 * Render a short string (known glyphs only) as half-block pixel Lines.
 * Unknown characters render as a single blank column.
 */
export function pixelLines(
  text: string,
  options: PixelMarkOptions = {},
): Line[] {
  const rows = Math.ceil(GLYPH_ROWS / 2);
  const columns: Column[] = [];
  const chars = Array.from(text);

  chars.forEach((char, index) => {
    const glyph = GLYPHS[char];
    const color = options.colors?.[char] ?? options.color ?? "accent";

    if (glyph) {
      columns.push(...glyphColumns(glyph, color));
      if (index < chars.length - 1) columns.push(...gapColumns());
    } else {
      columns.push(...gapColumns());
    }
  });

  const lines: Line[] = [];
  for (let row = 0; row < rows; row++) {
    const line: Line = [];
    for (const column of columns) {
      const pixel = column[row]!;
      const last = line[line.length - 1];
      if (last && last.color === pixel.color) {
        last.text += pixel.char;
      } else {
        line.push({ text: pixel.char, color: pixel.color });
      }
    }
    lines.push(line);
  }

  return lines;
}

/** The v56 brand mark: soft cyan v, bright 5, soft cyan 6. */
export function v56MarkLines(): Line[] {
  return pixelLines("v56", {
    colors: { v: "accent", "5": "ink", "6": "accent" },
  });
}
