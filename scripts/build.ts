import { chmod, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: [join(root, "src/cli.tsx")],
  outdir: dist,
  target: "node",
  format: "esm",
  splitting: true,
  minify: false,
  sourcemap: "none",
  external: [
    "ink",
    "open",
    "react",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
  ],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

const entry = join(dist, "cli.js");
const source = await readFile(entry, "utf8");

if (!source.startsWith("#!")) {
  await writeFile(entry, `#!/usr/bin/env node\n${source}`, "utf8");
}

try {
  await chmod(entry, 0o755);
} catch {
  // chmod is a no-op on Windows; npm sets the executable bit on install.
}

console.log("Built dist/cli.js");
