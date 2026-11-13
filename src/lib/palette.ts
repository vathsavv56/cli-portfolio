/**
 * The v56 terminal palette. Every color has an ANSI-256 fallback so the same
 * token renders identically on modern truecolor terminals and basic ones.
 */
export type ColorToken =
  | "accent"
  | "ink"
  | "muted"
  | "faint"
  | "frame"
  | "frameSoft"
  | "frameDeep"
  | "positive"
  | "warn"
  | "negative";

interface PaletteEntry {
  /** Hex value passed straight to Ink (it degrades to 256/16 automatically). */
  ink: string;
  /** ANSI-256 SGR parameters for the plain-text renderer. */
  ansi: string;
}

export const PALETTE: Record<ColorToken, PaletteEntry> = {
  accent: { ink: "#5FD7FF", ansi: "38;5;117" },
  ink: { ink: "#E4E4E4", ansi: "38;5;254" },
  muted: { ink: "#8A8A8A", ansi: "38;5;245" },
  faint: { ink: "#5A5A5A", ansi: "38;5;240" },
  frame: { ink: "#4E4E4E", ansi: "38;5;239" },
  frameSoft: { ink: "#3A3A3A", ansi: "38;5;237" },
  frameDeep: { ink: "#2A2A2A", ansi: "38;5;235" },
  positive: { ink: "#5FD787", ansi: "38;5;120" },
  warn: { ink: "#FFD75F", ansi: "38;5;221" },
  negative: { ink: "#FF5F5F", ansi: "38;5;203" },
};

/** Neutral chip background for pill-style labels. */
export const CHIP_BG = "#262626";
