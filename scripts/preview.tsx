/**
 * Headless preview of the interactive UI.
 *
 * Usage:
 *   bun scripts/preview.tsx            # a small tour
 *   bun scripts/preview.tsx home contact
 *
 * Frames are ANSI-stripped so they render cleanly in logs and chat.
 */
import { render } from "ink-testing-library";
import { App } from "../src/app/App";

const SIZE = { columns: 100, rows: 30 } as const;
const ANSI = /\u001B\[[0-9;]*m/gu;

const TOUR: Array<{ label: string; keys: string[] }> = [
  { label: "Home", keys: [] },
  { label: "Projects", keys: ["2"] },
  { label: "Project detail", keys: ["2", "\r"] },
  { label: "Writing", keys: ["3"] },
  { label: "Post detail", keys: ["3", "\r"] },
  { label: "Essay", keys: ["3", "\u001B[B", "\r"] },
  { label: "Contact", keys: ["4"] },
  { label: "Help", keys: ["?"] },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clean(frame: string | undefined): string {
  if (!frame) return "(no frame)";
  return frame.replace(ANSI, "").replace(/\s+$/u, "");
}

async function main(): Promise<void> {
  const requested = process.argv.slice(2);
  const screens =
    requested.length > 0
      ? TOUR.filter((screen) =>
          requested.some(
            (name) => name.toLowerCase() === screen.label.toLowerCase(),
          ),
        )
      : TOUR.slice(0, 3);

  if (screens.length === 0) {
    process.stderr.write(
      `Unknown screen. Try: ${TOUR.map((screen) => screen.label.toLowerCase()).join(", ")}\n`,
    );
    process.exitCode = 1;
    return;
  }

  const instance = render(<App sizeOverride={SIZE} initialSection="home" />);
  await sleep(150);

  for (const screen of screens) {
    for (const key of screen.keys) {
      instance.stdin.write(key);
      await sleep(90);
    }

    process.stdout.write(`\n${"═".repeat(SIZE.columns)}\n`);
    process.stdout.write(`  ${screen.label.toUpperCase()}\n`);
    process.stdout.write(`${"═".repeat(SIZE.columns)}\n`);
    process.stdout.write(`${clean(instance.lastFrame())}\n`);
  }

  instance.unmount();
  instance.cleanup();
}

await main();
