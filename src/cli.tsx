import { parseArgs } from "./lib/args";
import { renderHelp, renderPlain, renderVersion } from "./lib/plain";
import pkg from "../package.json";

const VERSION = pkg.version;

function terminalWidth(explicit: number | undefined): number {
  if (explicit !== undefined) return explicit;
  const columns = process.stdout.columns ?? 88;
  return Math.max(40, Math.min(columns, 88));
}

function colorEnabled(noColor: boolean): boolean {
  if (noColor) return false;
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.FORCE_COLOR === "0") return false;
  if (process.env.TERM === "dumb") return false;
  return Boolean(process.stdout.isTTY);
}

function canRunInteractive(): boolean {
  return Boolean(
    process.stdout.isTTY &&
      process.stdin.isTTY &&
      process.env.TERM !== "dumb" &&
      !process.env.CI,
  );
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.error) {
    process.stderr.write(`v56: ${parsed.error}\n`);
    process.exitCode = 1;
    return;
  }

  const { options } = parsed;
  const width = terminalWidth(options.width);
  const color = colorEnabled(options.noColor);

  if (options.version) {
    process.stdout.write(renderVersion(VERSION));
    return;
  }

  if (options.help) {
    process.stdout.write(renderHelp(VERSION, width, color));
    return;
  }

  if (!options.plain && canRunInteractive()) {
    if (options.noColor) {
      process.env.NO_COLOR = "1";
      process.env.FORCE_COLOR = "0";
    }

    try {
      const { launchApp } = await import("./app/index");
      await launchApp(options.section ?? "home");
      return;
    } catch (error) {
      process.stderr.write(
        "v56: the interactive view could not start. Showing the plain version.\n",
      );
      if (process.env.DEBUG) {
        process.stderr.write(`${String(error)}\n`);
      }
    }
  }

  process.stdout.write(
    await renderPlain({
      section: options.section,
      width,
      color,
    }),
  );
}

process.stdout.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EPIPE") {
    process.exit(0);
  }
  throw error;
});

main().catch((error: unknown) => {
  process.stderr.write(`v56: ${String(error)}\n`);
  process.exitCode = 1;
});
