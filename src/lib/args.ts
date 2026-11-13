import type { SectionId } from "../data/portfolio";

export interface CliOptions {
  section: SectionId | null;
  plain: boolean;
  help: boolean;
  version: boolean;
  noColor: boolean;
  width?: number;
}

export interface ParseResult {
  options: CliOptions;
  error?: string;
}

const SECTION_ALIASES: Record<string, SectionId> = {
  home: "home",
  about: "home",
  me: "home",
  projects: "projects",
  project: "projects",
  work: "projects",
  writing: "writing",
  blog: "writing",
  blogs: "writing",
  posts: "writing",
  essay: "writing",
  essays: "writing",
  philosophy: "writing",
  life: "writing",
  contact: "contact",
  links: "contact",
  email: "contact",
};

function parseWidth(value: string | undefined): number | string {
  if (value === undefined) return "Missing value for --width.";
  if (!/^\d+$/u.test(value)) return "Width must be a number between 40 and 200.";

  const width = Number(value);
  if (width < 40 || width > 200) {
    return "Width must be between 40 and 200.";
  }

  return width;
}

export function parseArgs(argv: readonly string[]): ParseResult {
  const options: CliOptions = {
    section: null,
    plain: false,
    help: false,
    version: false,
    noColor: false,
  };

  let positionalOnly = false;

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index]!;

    if (positionalOnly) {
      return {
        options,
        error: `Unexpected argument "${argument}".`,
      };
    }

    if (argument === "--") {
      positionalOnly = true;
      continue;
    }

    if (argument === "-h" || argument === "--help") {
      options.help = true;
      continue;
    }
    if (argument === "-v" || argument === "--version") {
      options.version = true;
      continue;
    }
    if (argument === "--plain" || argument === "--no-interactive") {
      options.plain = true;
      continue;
    }
    if (argument === "--no-color") {
      options.noColor = true;
      continue;
    }
    if (argument === "--width" || argument.startsWith("--width=")) {
      const inline = argument.startsWith("--width=")
        ? argument.slice("--width=".length)
        : undefined;
      const next = inline ?? argv[index + 1];
      if (inline === undefined) index++;
      const width = parseWidth(next);
      if (typeof width === "string") return { options, error: width };
      options.width = width;
      continue;
    }
    if (argument.startsWith("-")) {
      return {
        options,
        error: `Unknown option "${argument}".`,
      };
    }

    if (argument === "help") {
      options.help = true;
      continue;
    }
    if (argument === "version") {
      options.version = true;
      continue;
    }

    if (options.section !== null) {
      return {
        options,
        error: `Unexpected argument "${argument}". Only one section can be opened at a time.`,
      };
    }

    const section = SECTION_ALIASES[argument.toLowerCase()];
    if (!section) {
      return {
        options,
        error: `Unknown section "${argument}". Run "v56 --help" to see the available sections.`,
      };
    }
    options.section = section;
  }

  return { options };
}

export function sectionFromArg(value: string): SectionId | null {
  return SECTION_ALIASES[value.toLowerCase()] ?? null;
}
