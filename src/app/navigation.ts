import {
  CONTACT_LINKS,
  PROJECTS,
  SECTIONS,
  WRITING_ENTRIES,
  type SectionId,
} from "../data/portfolio";

export interface NavState {
  section: SectionId;
  projectIndex: number;
  projectOpen: boolean;
  writingIndex: number;
  postOpen: boolean;
  contactIndex: number;
  page: number;
  pageCount: number;
  helpOpen: boolean;
}

export type NavAction =
  | { type: "navigate"; section: SectionId }
  | { type: "cycleSection"; delta: 1 | -1 }
  | { type: "moveSelection"; delta: 1 | -1 }
  | { type: "openSelection" }
  | { type: "back" }
  | { type: "nextPage"; delta: 1 | -1 }
  | { type: "setPageCount"; count: number }
  | { type: "toggleHelp"; open?: boolean };

const SECTION_INDEX = new Map<SectionId, number>(
  SECTIONS.map((section, index) => [section.id, index]),
);

export function createInitialState(section: SectionId = "home"): NavState {
  return {
    section,
    projectIndex: 0,
    projectOpen: false,
    writingIndex: 0,
    postOpen: false,
    contactIndex: 0,
    page: 0,
    pageCount: 1,
    helpOpen: false,
  };
}

function wrapIndex(index: number, delta: number, count: number): number {
  if (count <= 0) return 0;
  return (index + delta + count) % count;
}

function clampPage(page: number, pageCount: number): number {
  return Math.max(0, Math.min(page, Math.max(0, pageCount - 1)));
}

function resetView(state: NavState): NavState {
  return {
    ...state,
    projectOpen: false,
    postOpen: false,
    page: 0,
    pageCount: 1,
    helpOpen: false,
  };
}

export function navigationReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case "navigate": {
      if (action.section === state.section) {
        return resetView(state);
      }

      return resetView({ ...state, section: action.section });
    }

    case "cycleSection": {
      const current = SECTION_INDEX.get(state.section) ?? 0;
      const nextIndex = wrapIndex(current, action.delta, SECTIONS.length);
      const next = SECTIONS[nextIndex]!.id;
      return resetView({ ...state, section: next });
    }

    case "moveSelection": {
      if (state.helpOpen) return state;

      switch (state.section) {
        case "projects": {
          if (state.projectOpen) {
            return {
              ...state,
              page: clampPage(state.page + action.delta, state.pageCount),
            };
          }
          return {
            ...state,
            projectIndex: wrapIndex(
              state.projectIndex,
              action.delta,
              Math.max(1, PROJECTS.length),
            ),
          };
        }
        case "writing": {
          if (state.postOpen) {
            return {
              ...state,
              page: clampPage(state.page + action.delta, state.pageCount),
            };
          }
          return {
            ...state,
            writingIndex: wrapIndex(
              state.writingIndex,
              action.delta,
              Math.max(1, WRITING_ENTRIES.length),
            ),
          };
        }
        case "contact": {
          return {
            ...state,
            contactIndex: wrapIndex(
              state.contactIndex,
              action.delta,
              Math.max(1, CONTACT_LINKS.length),
            ),
          };
        }
        case "home": {
          return {
            ...state,
            page: clampPage(state.page + action.delta, state.pageCount),
          };
        }
      }
    }

    case "openSelection": {
      switch (state.section) {
        case "home":
          return resetView({ ...state, section: "projects" });
        case "projects":
          return {
            ...state,
            projectOpen: true,
            page: 0,
            pageCount: 1,
          };
        case "writing":
          return {
            ...state,
            postOpen: true,
            page: 0,
            pageCount: 1,
          };
        case "contact":
          return state;
      }
    }

    case "back": {
      if (state.helpOpen) {
        return { ...state, helpOpen: false };
      }
      if (state.projectOpen) {
        return { ...state, projectOpen: false, page: 0, pageCount: 1 };
      }
      if (state.postOpen) {
        return { ...state, postOpen: false, page: 0, pageCount: 1 };
      }
      if (state.section !== "home") {
        return resetView({ ...state, section: "home" });
      }
      return state;
    }

    case "nextPage": {
      return {
        ...state,
        page: clampPage(state.page + action.delta, state.pageCount),
      };
    }

    case "setPageCount": {
      const pageCount = Math.max(1, action.count);
      return {
        ...state,
        pageCount,
        page: clampPage(state.page, pageCount),
      };
    }

    case "toggleHelp": {
      const open = action.open ?? !state.helpOpen;
      return {
        ...state,
        helpOpen: open,
        page: 0,
        pageCount: 1,
      };
    }
  }
}
