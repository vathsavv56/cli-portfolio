import { describe, expect, test } from "bun:test";
import {
  CONTACT_LINKS,
  PROJECTS,
  WRITING_ENTRIES,
} from "../src/data/portfolio";
import {
  createInitialState,
  navigationReducer,
  type NavState,
} from "../src/app/navigation";

function withState(overrides: Partial<NavState>): NavState {
  return { ...createInitialState(), ...overrides };
}

describe("createInitialState", () => {
  test("starts on home", () => {
    expect(createInitialState()).toEqual({
      section: "home",
      projectIndex: 0,
      projectOpen: false,
      writingIndex: 0,
      postOpen: false,
      contactIndex: 0,
      page: 0,
      pageCount: 1,
      helpOpen: false,
    });
  });

  test("can start on another section", () => {
    expect(createInitialState("contact").section).toBe("contact");
  });
});

describe("navigationReducer", () => {
  test("navigating to a new section resets transient state", () => {
    const state = withState({
      section: "projects",
      projectOpen: true,
      page: 2,
      pageCount: 4,
      helpOpen: true,
    });
    const next = navigationReducer(state, {
      type: "navigate",
      section: "contact",
    });

    expect(next.section).toBe("contact");
    expect(next.projectOpen).toBe(false);
    expect(next.page).toBe(0);
    expect(next.pageCount).toBe(1);
    expect(next.helpOpen).toBe(false);
  });

  test("navigating to the current section still resets the view", () => {
    const state = withState({ section: "projects", projectOpen: true });
    const next = navigationReducer(state, {
      type: "navigate",
      section: "projects",
    });

    expect(next.projectOpen).toBe(false);
  });

  test("cycles sections in both directions, wrapping around", () => {
    expect(
      navigationReducer(createInitialState("home"), {
        type: "cycleSection",
        delta: 1,
      }).section,
    ).toBe("projects");
    expect(
      navigationReducer(createInitialState("home"), {
        type: "cycleSection",
        delta: -1,
      }).section,
    ).toBe("contact");
  });

  test("selection wraps around the project list", () => {
    const state = createInitialState("projects");
    const previous = navigationReducer(state, {
      type: "moveSelection",
      delta: -1,
    });

    expect(previous.projectIndex).toBe(PROJECTS.length - 1);
  });

  test("opening a project and paging through its detail", () => {
    let state = createInitialState("projects");
    state = navigationReducer(state, { type: "openSelection" });
    expect(state.projectOpen).toBe(true);
    expect(state.page).toBe(0);

    state = navigationReducer(state, { type: "setPageCount", count: 3 });
    state = navigationReducer(state, { type: "moveSelection", delta: 1 });
    expect(state.page).toBe(1);

    state = navigationReducer(state, { type: "moveSelection", delta: -1 });
    expect(state.page).toBe(0);
  });

  test("selection wraps around the writing list", () => {
    const state = createInitialState("writing");
    const previous = navigationReducer(state, {
      type: "moveSelection",
      delta: -1,
    });

    expect(previous.writingIndex).toBe(WRITING_ENTRIES.length - 1);
  });

  test("selection wraps around the contact list", () => {
    const state = createInitialState("contact");
    const previous = navigationReducer(state, {
      type: "moveSelection",
      delta: -1,
    });

    expect(previous.contactIndex).toBe(CONTACT_LINKS.length - 1);
  });

  test("paging is clamped to the available pages", () => {
    let state = withState({ section: "home", pageCount: 2 });
    state = navigationReducer(state, { type: "moveSelection", delta: 1 });
    expect(state.page).toBe(1);
    state = navigationReducer(state, { type: "moveSelection", delta: 1 });
    expect(state.page).toBe(1);
    state = navigationReducer(state, { type: "moveSelection", delta: -1 });
    expect(state.page).toBe(0);
    state = navigationReducer(state, { type: "moveSelection", delta: -1 });
    expect(state.page).toBe(0);
  });

  test("back closes help, then details, then returns home", () => {
    let state = withState({ section: "projects", helpOpen: true });
    state = navigationReducer(state, { type: "back" });
    expect(state.helpOpen).toBe(false);

    state = withState({ section: "projects", projectOpen: true });
    state = navigationReducer(state, { type: "back" });
    expect(state.projectOpen).toBe(false);

    state = withState({ section: "contact" });
    state = navigationReducer(state, { type: "back" });
    expect(state.section).toBe("home");
  });

  test("back on home is a no-op", () => {
    const state = createInitialState("home");
    expect(navigationReducer(state, { type: "back" })).toEqual(state);
  });

  test("opening a post sets the writing detail state", () => {
    const state = navigationReducer(createInitialState("writing"), {
      type: "openSelection",
    });

    expect(state.postOpen).toBe(true);
    expect(state.page).toBe(0);
  });

  test("toggling help starts on the first page and closes cleanly", () => {
    let state = withState({ section: "home", page: 2, pageCount: 3 });
    state = navigationReducer(state, { type: "toggleHelp" });
    expect(state.helpOpen).toBe(true);
    expect(state.page).toBe(0);
    expect(state.pageCount).toBe(1);

    state = navigationReducer(state, { type: "toggleHelp", open: false });
    expect(state.helpOpen).toBe(false);
  });

  test("setPageCount clamps the current page", () => {
    const state = withState({ page: 5 });
    const next = navigationReducer(state, { type: "setPageCount", count: 2 });

    expect(next.pageCount).toBe(2);
    expect(next.page).toBe(1);
  });
});
