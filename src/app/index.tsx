import { render } from "ink";
import type { SectionId } from "../data/portfolio";
import { App } from "./App";

export async function launchApp(initialSection: SectionId): Promise<void> {
  const instance = render(<App initialSection={initialSection} />, {
    exitOnCtrlC: true,
    patchConsole: false,
  });

  await instance.waitUntilExit();
}
