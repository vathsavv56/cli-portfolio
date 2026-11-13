import { describe, expect, test } from "bun:test";
import { parseArgs, sectionFromArg } from "../src/lib/args";

describe("parseArgs", () => {
  test("returns defaults for an empty command line", () => {
    const { options, error } = parseArgs([]);

    expect(error).toBeUndefined();
    expect(options).toEqual({
      section: null,
      plain: false,
      help: false,
      version: false,
      noColor: false,
    });
  });

  test("accepts section names and aliases", () => {
    expect(parseArgs(["projects"]).options.section).toBe("projects");
    expect(parseArgs(["work"]).options.section).toBe("projects");
    expect(parseArgs(["blog"]).options.section).toBe("writing");
    expect(parseArgs(["philosophy"]).options.section).toBe("writing");
    expect(parseArgs(["me"]).options.section).toBe("home");
    expect(parseArgs(["links"]).options.section).toBe("contact");
  });

  test("combines a section with flags", () => {
    const { options, error } = parseArgs([
      "--plain",
      "writing",
      "--no-color",
      "--width",
      "72",
    ]);

    expect(error).toBeUndefined();
    expect(options.section).toBe("writing");
    expect(options.plain).toBe(true);
    expect(options.noColor).toBe(true);
    expect(options.width).toBe(72);
  });

  test("supports --width=N", () => {
    const { options, error } = parseArgs(["--width=40"]);

    expect(error).toBeUndefined();
    expect(options.width).toBe(40);
  });

  test("rejects a missing or invalid width", () => {
    expect(parseArgs(["--width"]).error).toContain("Missing value");
    expect(parseArgs(["--width", "abc"]).error).toContain("number");
    expect(parseArgs(["--width", "39"]).error).toContain("between 40 and 200");
    expect(parseArgs(["--width", "201"]).error).toContain("between 40 and 200");
  });

  test("accepts help and version as flags or words", () => {
    expect(parseArgs(["--help"]).options.help).toBe(true);
    expect(parseArgs(["-h"]).options.help).toBe(true);
    expect(parseArgs(["help"]).options.help).toBe(true);
    expect(parseArgs(["--version"]).options.version).toBe(true);
    expect(parseArgs(["-v"]).options.version).toBe(true);
    expect(parseArgs(["version"]).options.version).toBe(true);
  });

  test("rejects unknown options and sections", () => {
    expect(parseArgs(["--nope"]).error).toContain('Unknown option "--nope"');
    expect(parseArgs(["nope"]).error).toContain('Unknown section "nope"');
  });

  test("rejects more than one section", () => {
    expect(parseArgs(["home", "projects"]).error).toContain(
      "Only one section can be opened",
    );
  });

  test("rejects positional arguments after --", () => {
    expect(parseArgs(["--", "projects"]).error).toContain(
      'Unexpected argument "projects"',
    );
  });

  test("sectionFromArg is case-insensitive", () => {
    expect(sectionFromArg("PROJECTS")).toBe("projects");
    expect(sectionFromArg("Blog")).toBe("writing");
    expect(sectionFromArg("unknown")).toBeNull();
  });
});
