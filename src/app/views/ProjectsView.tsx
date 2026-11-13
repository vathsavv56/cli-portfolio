import { Box, Text } from "ink";
import { useMemo } from "react";
import { InkLine } from "../Document";
import { SectionTitle } from "../ui";
import type { Project } from "../../data/portfolio";
import { PALETTE } from "../../lib/palette";
import { layoutBlocks, span, type DocBlock } from "../../lib/document";

function displayUrl(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./u, "");
  } catch {
    return url;
  }
}

function ProjectList({
  projects,
  selectedIndex,
  width,
}: {
  projects: Project[];
  selectedIndex: number;
  width: number;
}) {
  return (
    <Box flexDirection="column" width={width} flexShrink={0}>
      {projects.map((project, index) => {
        const active = index === selectedIndex;
        return (
          <Box key={project.id}>
            <Text>
              {active ? (
                <>
                  <Text color={PALETTE.accent.ink} bold>› </Text>
                  <Text color={PALETTE.accent.ink}>{String(index + 1).padStart(2, "0")}</Text>
                  <Text bold>{`  ${project.name}`}</Text>
                </>
              ) : (
                <Text color={PALETTE.muted.ink}>
                  {`  ${String(index + 1).padStart(2, "0")}  ${project.name}`}
                </Text>
              )}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

function DetailCard({
  project,
  contentWidth,
  boxed,
}: {
  project: Project;
  contentWidth: number;
  boxed: boolean;
}) {
  const highlightLines = useMemo(
    () =>
      layoutBlocks(
        project.highlights.map(
          (item): DocBlock => ({ type: "bullet", spans: [span(item)] }),
        ),
        Math.max(20, contentWidth),
      ),
    [project, contentWidth],
  );

  const body = (
    <Box flexDirection="column" flexGrow={1}>
      <Text>
        <Text color={PALETTE.accent.ink}>▌ </Text>
        <Text color={PALETTE.ink.ink} bold>
          {project.name}
        </Text>
        <Text color={PALETTE.muted.ink}>{`  ·  ${project.subtitle}`}</Text>
      </Text>

      <Box marginTop={1}>
        <Text color={PALETTE.ink.ink}>{project.description}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text>
          <Text color={PALETTE.accent.ink}>▌ </Text>
          <Text color={PALETTE.ink.ink} bold>Highlights</Text>
        </Text>
        <Box marginTop={1} flexDirection="column">
          {highlightLines.map((line, index) => (
            <InkLine key={index} line={line} />
          ))}
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text>
          <Text color={PALETTE.accent.ink} bold>{"stack  "}</Text>
          {project.tags.map((tag, index) => (
            <Text key={tag}>
              {index > 0 ? <Text color={PALETTE.faint.ink}>{" · "}</Text> : null}
              <Text color={PALETTE.ink.ink}>{tag}</Text>
            </Text>
          ))}
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text>
          {project.demo ? (
            <>
              <Text color={PALETTE.accent.ink} bold>↗ </Text>
              <Text color={PALETTE.accent.ink}>{displayUrl(project.demo)}</Text>
            </>
          ) : (
            <Text color={PALETTE.muted.ink}>No public demo</Text>
          )}
          {project.demo && project.github ? <Text color={PALETTE.muted.ink}>{"   ·   "}</Text> : null}
          {project.github ? (
            <>
              <Text color={PALETTE.muted.ink} bold>↗ </Text>
              <Text color={PALETTE.muted.ink}>{displayUrl(project.github)}</Text>
            </>
          ) : null}
        </Text>
      </Box>
    </Box>
  );

  if (!boxed) return body;

  return (
    <Box
      borderStyle="round"
      borderColor={PALETTE.frame.ink}
      paddingX={1}
      flexDirection="column"
    >
      {body}
    </Box>
  );
}

export function ProjectsView({
  projects,
  selectedIndex,
  width,
}: {
  projects: Project[];
  selectedIndex: number;
  width: number;
}) {
  const selected = projects[selectedIndex] ?? projects[0];
  const wide = width >= 76;

  return (
    <Box flexDirection="column">
      <SectionTitle
        title="Projects"
        right={`${String(selectedIndex + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`}
      />

      {wide ? (
        <Box marginTop={1} gap={2}>
          <ProjectList projects={projects} selectedIndex={selectedIndex} width={30} />
          {selected ? (
            <DetailCard project={selected} contentWidth={width - 32} boxed={false} />
          ) : null}
        </Box>
      ) : (
        <Box marginTop={1} flexDirection="column">
          <ProjectList projects={projects} selectedIndex={selectedIndex} width={width - 2} />
          {selected ? (
            <DetailCard project={selected} contentWidth={width - 4} boxed />
          ) : null}
        </Box>
      )}
    </Box>
  );
}
