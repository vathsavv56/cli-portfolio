import { Box, useApp, useInput } from "ink";
import { useCallback, useMemo, useReducer, useState, type ReactNode } from "react";
import {
  CONTACT_LINKS,
  PROFILE,
  PROJECTS,
  SECTIONS,
  WRITING_ENTRIES,
  type SectionId,
} from "../data/portfolio";
import { projectBlocks } from "../content/blocks";
import { helpBlocks } from "../lib/plain";
import { openInBrowser } from "../lib/open";
import { Document } from "./Document";
import {
  createInitialState,
  navigationReducer,
  type NavState,
} from "./navigation";
import { Footer, Header, type FooterHint } from "./ui";
import {
  useTerminalSize,
  type TerminalSizeOverride,
} from "./useTerminalSize";
import { ContactView } from "./views/ContactView";
import { HomeView } from "./views/HomeView";
import { ProjectsView } from "./views/ProjectsView";
import { WritingDetail } from "./views/WritingDetail";
import { WritingView } from "./views/WritingView";

export interface AppProps {
  initialSection?: SectionId;
  sizeOverride?: TerminalSizeOverride;
}

function modeOf(state: NavState): string {
  if (state.helpOpen) return "HELP";
  if (state.projectOpen || state.postOpen) return "VIEW";
  return state.section.toUpperCase();
}

function pageHint(state: NavState): FooterHint | null {
  return state.pageCount > 1
    ? { label: `↑↓ page ${state.page + 1}/${state.pageCount}` }
    : null;
}

function footerHints(
  state: NavState,
  width: number,
): FooterHint[] {
  const page = pageHint(state);
  const hints: FooterHint[] = [];

  if (state.helpOpen) {
    if (page) hints.push(page);
    hints.push({ key: "esc", label: "close" }, { key: "q", label: "quit" });
  } else if (state.projectOpen) {
    if (page) hints.push(page);
    hints.push({ key: "o", label: "live" });
    if (PROJECTS[state.projectIndex]?.github) {
      hints.push({ key: "g", label: "github" });
    }
    hints.push(
      { key: "esc", label: "back" },
      { key: "?", label: "help" },
      { key: "q", label: "quit" },
    );
  } else if (state.postOpen) {
    if (page) hints.push(page);
    hints.push(
      { key: "o", label: "online" },
      { key: "esc", label: "back" },
      { key: "?", label: "help" },
      { key: "q", label: "quit" },
    );
  } else {
    switch (state.section) {
      case "home":
        if (page) hints.push(page);
        hints.push(
          { key: "2", label: "projects" },
          { key: "3", label: "writing" },
          { key: "?", label: "help" },
          { key: "q", label: "quit" },
        );
        break;
      case "projects":
        hints.push(
          { label: "↑↓ select" },
          { key: "enter", label: "details" },
          { key: "o", label: "live" },
          { key: "?", label: "help" },
          { key: "q", label: "quit" },
        );
        break;
      case "writing":
        hints.push(
          { label: "↑↓ select" },
          { key: "enter", label: "read" },
          { key: "o", label: "online" },
          { key: "?", label: "help" },
          { key: "q", label: "quit" },
        );
        break;
      case "contact":
        hints.push(
          { label: "↑↓ select" },
          { key: "enter", label: "open" },
          { key: "e", label: "email" },
          { key: "?", label: "help" },
          { key: "q", label: "quit" },
        );
        break;
    }
  }

  const modeWidth = modeOf(state).length + 6;
  const budget = Math.max(
    16,
    width - 4 - modeWidth - (width >= 80 ? 15 : 0),
  );
  const lengthOf = (hint: FooterHint): number =>
    hint.label.length + (hint.key ? hint.key.length + 1 : 0);
  while (hints.length > 1) {
    const joined =
      hints.reduce(
        (total, hint) => total + lengthOf(hint) + 5,
        -5,
      );
    if (joined <= budget) break;
    hints.splice(hints.length - 2, 1);
  }

  return hints;
}

export function App({
  initialSection = "home",
  sizeOverride,
}: AppProps) {
  const { exit } = useApp();
  const { columns, rows } = useTerminalSize(sizeOverride);
  const [state, dispatch] = useReducer(navigationReducer, initialSection, createInitialState);
  const [notice, setNotice] = useState<string | null>(null);

  const width = Math.min(columns, 100);
  const rootHeight = Math.max(18, rows - 1);
  const contentWidth = Math.max(24, width - 4);
  const docLines = Math.max(4, Math.max(8, rootHeight - 6));

  const onPageCount = useCallback((count: number) => {
    dispatch({ type: "setPageCount", count });
  }, []);

  const helpBlocksMemo = useMemo(() => helpBlocks(), []);
  const selectedProject = PROJECTS[state.projectIndex] ?? PROJECTS[0]!;
  const selectedEntry =
    WRITING_ENTRIES[state.writingIndex] ?? WRITING_ENTRIES[0]!;
  const projectDetailBlocks = useMemo(
    () => projectBlocks(selectedProject, state.projectIndex),
    [selectedProject, state.projectIndex],
  );

  const openLink = useCallback((url: string | undefined) => {
    if (!url) {
      setNotice("No link for this one yet.");
      return;
    }
    setNotice(null);
    void openInBrowser(url).catch(() => {
      setNotice("Could not open a browser. The URL is shown on screen.");
    });
  }, []);

  const openPrimary = useCallback(() => {
    if (state.helpOpen) return;

    if (state.projectOpen || state.section === "projects") {
      openLink(selectedProject.demo ?? selectedProject.github);
      return;
    }
    if (state.postOpen || state.section === "writing") {
      openLink(selectedEntry.url);
      return;
    }
    if (state.section === "contact") {
      openLink(CONTACT_LINKS[state.contactIndex]?.url);
      return;
    }
    openLink(PROFILE.links.portfolio);
  }, [
    openLink,
    selectedEntry.url,
    selectedProject.demo,
    selectedProject.github,
    state.contactIndex,
    state.helpOpen,
    state.postOpen,
    state.projectOpen,
    state.section,
  ]);

  const openGithub = useCallback(() => {
    if (state.section === "projects") {
      openLink(selectedProject.github ?? PROFILE.links.github);
      return;
    }
    openLink(PROFILE.links.github);
  }, [openLink, selectedProject.github, state.section]);

  const openEmail = useCallback(() => {
    openLink(PROFILE.links.gmailCompose);
  }, [openLink]);

  const handleEnter = useCallback(() => {
    if (state.helpOpen) {
      dispatch({ type: "toggleHelp", open: false });
      return;
    }
    if (state.projectOpen) {
      openPrimary();
      return;
    }
    if (state.postOpen) {
      openPrimary();
      return;
    }
    if (state.section === "contact") {
      openPrimary();
      return;
    }
    dispatch({ type: "openSelection" });
  }, [openPrimary, state.helpOpen, state.postOpen, state.projectOpen, state.section]);

  useInput((input, key) => {
    if (input === "q") {
      exit();
      return;
    }

    setNotice(null);

    if (input === "?") {
      dispatch({ type: "toggleHelp" });
      return;
    }

    if (/^[1-4]$/u.test(input)) {
      const section = SECTIONS[Number(input) - 1]?.id;
      if (section) dispatch({ type: "navigate", section });
      return;
    }

    if (key.escape) {
      dispatch({ type: "back" });
      return;
    }

    if (state.helpOpen) {
      if (key.upArrow || input === "k") {
        dispatch({ type: "nextPage", delta: -1 });
      } else if (key.downArrow || input === "j") {
        dispatch({ type: "nextPage", delta: 1 });
      }
      return;
    }

    if (key.leftArrow) {
      dispatch({ type: "cycleSection", delta: -1 });
      return;
    }
    if (key.rightArrow) {
      dispatch({ type: "cycleSection", delta: 1 });
      return;
    }
    if (key.upArrow || input === "k") {
      dispatch({ type: "moveSelection", delta: -1 });
      return;
    }
    if (key.downArrow || input === "j") {
      dispatch({ type: "moveSelection", delta: 1 });
      return;
    }
    if (key.return) {
      handleEnter();
      return;
    }
    if (input === "o") {
      openPrimary();
      return;
    }
    if (input === "g") {
      openGithub();
      return;
    }
    if (input === "e") {
      openEmail();
    }
  });

  let content: ReactNode;

  if (state.helpOpen) {
    content = (
      <Document
        blocks={helpBlocksMemo}
        width={contentWidth}
        maxLines={docLines}
        page={state.page}
        onPageCount={onPageCount}
      />
    );
  } else if (state.projectOpen) {
    content = (
      <Document
        blocks={projectDetailBlocks}
        width={contentWidth}
        maxLines={docLines}
        page={state.page}
        onPageCount={onPageCount}
      />
    );
  } else if (state.postOpen) {
    content = (
      <WritingDetail
        entry={selectedEntry}
        width={contentWidth}
        maxLines={docLines}
        page={state.page}
        onPageCount={onPageCount}
      />
    );
  } else {
    switch (state.section) {
      case "home":
        content = (
          <HomeView width={contentWidth} />
        );
        break;
      case "projects":
        content = (
          <ProjectsView
            projects={PROJECTS}
            selectedIndex={state.projectIndex}
            width={contentWidth}
          />
        );
        break;
      case "writing":
        content = (
          <WritingView
            entries={WRITING_ENTRIES}
            selectedIndex={state.writingIndex}
            width={contentWidth}
          />
        );
        break;
      case "contact":
        content = (
          <ContactView
            links={CONTACT_LINKS}
            selectedIndex={state.contactIndex}
            width={contentWidth}
          />
        );
        break;
    }
  }

  return (
    <Box width={columns} alignItems="center">
      <Box width={width} height={rootHeight} flexDirection="column">
        <Header section={state.section} width={width} />
        <Box
          paddingX={2}
          paddingTop={1}
          flexGrow={1}
          flexDirection="column"
          overflow="hidden"
        >
          {content}
        </Box>
        <Footer
          mode={modeOf(state)}
          hints={footerHints(state, width)}
          width={width}
          notice={notice}
        />
      </Box>
    </Box>
  );
}
