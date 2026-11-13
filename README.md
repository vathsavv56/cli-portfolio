# v56

Vathsav Inavolu's portfolio, in your terminal. An Ink-powered TUI with a plain-text fallback, drawn with a refined ANSI-256 palette and a half-block pixel mark that renders identically on truecolor and 16-color terminals.

## Run it

```bash
npx @vathsavv56/v56
```

or with Bun:

```bash
bunx @vathsavv56/v56
```

Once installed, the command is also available as `v56`.

## What it looks like

```
  █   █  █▀▀▀▀  ▄▀▀▀▄
  ▀▄ ▄▀  █▄▄▄   █▄▄▄
   ▀▄▀   ▄▄▄▄▀  ▀▄▄▄▀

  Vathsav Inavolu
  ● Open to software engineering internships
  Curious · Relentless · Driven · Guntur, India

  ──────────────────────────────────────────────────────────────────────

  ▌ About Me

  Hi, I'm Vathsav. I love building and learning new things, and I'm
  deeply curious about computers and how things work under the hood.
  I've been inspired by people who live with intention, and that shapes
  my own outlook on life: nothing is permanent, and every moment counts.
  So instead of coasting through life like an NPC, I choose to play it
  like the main character.

  → Why NPC isn't an option · https://vathsavv56.vercel.app/philosophy

  ▌ Featured Projects

  01 kernUI-v2 · React, TypeScript, Tailwind CSS
  02 API Client · Bun, React, TypeScript
  03 React-loaders · React, TypeScript, Node.js

  → npx @vathsavv56/v56 projects for every project and link.
```

This is the `--plain` render; the interactive TUI adds a tab bar, statusline, selection, and color.

## Sections

| Key | Section  | What's inside                                  |
| --- | -------- | ---------------------------------------------- |
| `1` | home     | About, featured work, and what I'm doing now   |
| `2` | projects | Things I've built, the stack, and live links   |
| `3` | writing  | A blog post and an essay on living fully       |
| `4` | contact  | Email, GitHub, X, LinkedIn, and the rest       |

Open a specific section directly:

```bash
npx @vathsavv56/v56 projects
npx @vathsavv56/v56 writing
npx @vathsavv56/v56 contact
```

Aliases such as `work`, `blog`, `philosophy`, `links`, and `email` also work.

## Keys

| Key            | Action                          |
| -------------- | ------------------------------- |
| `←` `→`        | Move between sections           |
| `1`–`4`        | Jump to a section               |
| `↑` `↓` / `j` `k` | Move selection or scroll     |
| `Enter`        | Open the selected item          |
| `o`            | Open the current item online    |
| `e`            | Email me                        |
| `?`            | Toggle help                     |
| `Esc`          | Go back                         |
| `q`            | Quit                            |

## Plain text

Add `--plain` for a non-interactive render, useful for pipes and logs. It draws the same pixel mark and palette as the TUI:

```bash
npx @vathsavv56/v56 --plain
npx @vathsavv56/v56 writing --plain
npx @vathsavv56/v56 --plain > portfolio.txt
```

Options:

```text
--plain         render plain text instead of the interactive UI
--no-color      disable ANSI colors
--width N       constrain output width (defaults to the terminal width)
--help          show every command and key
--version       print the version
```

## Writing

Blog posts are fetched at runtime from the same raw GitHub source the portfolio website uses. Nothing is bundled into the package, so the terminal always shows the current post. If the network is unavailable, the CLI shows the post's metadata and a link to read it online.

The essay "On Living Fully" ships with the package.

## Requirements

- Node.js 20 or newer, or Bun
- A terminal for the interactive view (plain mode works anywhere)

## Design

- **Palette** — eight curated ANSI-256 tokens (soft cyan accent, off-white ink, layered grays, semantic green/yellow/red) that degrade cleanly to 256-color and 16-color terminals
- **Pixel mark** — the `v56` glyph art is packed two pixel-rows per terminal line with half blocks, so it stays crisp in both the interactive UI and plain output
- **Adaptive** — the layout reflows for narrow terminals and the tab bar collapses to a single active chip

## Development

```bash
bun install
bun run dev        # interactive
bun run preview    # headless UI snapshots
bun run check      # typecheck + tests
bun run build      # bundle to dist/
```

## License

MIT
