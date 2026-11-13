import { Box, Text } from "ink";
import { useMemo } from "react";
import { InkLine } from "../Document";
import { ABOUT, PROFILE, PROJECTS } from "../../data/portfolio";
import { SectionTitle } from "../ui";
import { layoutBlocks, span, type DocBlock } from "../../lib/document";
import { PALETTE } from "../../lib/palette";
import { v56MarkLines } from "../../lib/pixel";

function highlight(text: string, phrase: string) {
  const index = text.indexOf(phrase);
  if (index === -1) return [text];

  return [
    text.slice(0, index),
    <Text key="highlight" bold color={PALETTE.accent.ink} underline>
      {phrase}
    </Text>,
    text.slice(index + phrase.length),
  ];
}

function ProjectRow({
  project,
  index,
  namePad,
}: {
  project: (typeof PROJECTS)[number];
  index: number;
  namePad: number;
}) {
  return (
    <Text>
      <Text color={PALETTE.accent.ink}>
        {`${String(index + 1).padStart(2, "0")} `}
      </Text>
      <Text color={PALETTE.ink.ink} bold>
        {project.name.padEnd(namePad)}
      </Text>
      <Text color={PALETTE.faint.ink}>{" · "}</Text>
      <Text color={PALETTE.muted.ink}>{project.subtitle}</Text>
    </Text>
  );
}

function TraitTag({ trait }: { trait: string }) {
  return (
    <Text>
      <Text color={PALETTE.faint.ink}>{"[ "}</Text>
      <Text color={PALETTE.ink.ink}>{trait}</Text>
      <Text color={PALETTE.faint.ink}>{" ]"}</Text>
    </Text>
  );
}

function Traits() {
  return (
    <Box gap={2}>
      {PROFILE.traits.map((trait) => (
        <TraitTag key={trait} trait={trait} />
      ))}
    </Box>
  );
}

export function HomeView({ width }: { width: number }) {
  const wide = width >= 72;
  const featured = PROJECTS.filter((project) => project.featured);
  const namePad = Math.max(...featured.map((project) => project.name.length));
  const mark = useMemo(() => v56MarkLines(), []);

  const nowLines = useMemo(
    () =>
      layoutBlocks(
        [
          { type: "paragraph", spans: [span(PROFILE.education)] },
          {
            type: "keyValue",
            key: "focus",
            value: [span(PROFILE.focus)],
          },
        ] satisfies DocBlock[],
        Math.max(24, wide ? 44 : width),
      ),
    [wide, width],
  );

  const about = (
    <Box flexDirection="column" gap={1}>
      <SectionTitle title="About" />
      <Text color={PALETTE.ink.ink}>
        {ABOUT.lead} {highlight(ABOUT.values, ABOUT.highlight)} {ABOUT.close}
      </Text>
      <Text>
        <Text color={PALETTE.accent.ink}>→ </Text>
        <Text italic>Why NPC isn't an option</Text>
        <Text color={PALETTE.muted.ink}>
          {"  ·  press "}
          <Text color={PALETTE.accent.ink} bold>3</Text>
        </Text>
      </Text>
    </Box>
  );

  const featuredSection = (
    <Box flexDirection="column" flexGrow={1}>
      <SectionTitle title="Featured" />
      <Box marginTop={1} flexDirection="column">
        {featured.map((project, index) => (
          <ProjectRow
            key={project.id}
            project={project}
            index={index}
            namePad={namePad}
          />
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color={PALETTE.muted.ink}>
          → press <Text color={PALETTE.accent.ink} bold>2</Text> for all{" "}
          {PROJECTS.length} projects
        </Text>
      </Box>
    </Box>
  );

  const nowSection = (columnWidth: number) => (
    <Box flexDirection="column" width={columnWidth} flexShrink={0}>
      <SectionTitle title="Now" />
      <Box marginTop={1} flexDirection="column">
        {nowLines.map((line, index) => (
          <InkLine key={index} line={line} />
        ))}
      </Box>
    </Box>
  );

  return (
    <Box flexDirection="column">
      <Box gap={2} alignItems="center">
        <Box flexDirection="column" width={19} flexShrink={0}>
          {mark.map((line, index) => (
            <InkLine key={index} line={line} />
          ))}
        </Box>

        <Box flexDirection="column">
          <Text color={PALETTE.ink.ink} bold>
            {PROFILE.name}
          </Text>
          <Text>
            <Text color={PALETTE.positive.ink}>● </Text>
            <Text color={PALETTE.ink.ink} bold>
              {PROFILE.availability}
            </Text>
          </Text>
          {!wide ? <Text color={PALETTE.muted.ink}>{PROFILE.location}</Text> : null}
        </Box>
      </Box>

      <Box marginTop={1}>
        <Traits />
      </Box>

      <Box marginTop={1}>{about}</Box>

      {wide ? (
        <Box marginTop={1} gap={3}>
          {featuredSection}
          {nowSection(44)}
        </Box>
      ) : (
        <Box marginTop={1} flexDirection="column">
          {featuredSection}
          <Box marginTop={1}>{nowSection(width)}</Box>
        </Box>
      )}
    </Box>
  );
}
