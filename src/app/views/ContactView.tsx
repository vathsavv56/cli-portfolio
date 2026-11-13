import { Box, Text } from "ink";
import { SectionTitle } from "../ui";
import { PROFILE, type ContactLink } from "../../data/portfolio";
import { PALETTE } from "../../lib/palette";

const TAGS: Record<string, string> = {
  email: "@",
  github: "gh",
  x: "x",
  linkedin: "in",
  resume: "cv",
  portfolio: "web",
  context: "md",
};

const LABEL_WIDTH = 10;
const TAG_WIDTH = 4;

export function ContactView({
  links,
  selectedIndex,
}: {
  links: ContactLink[];
  selectedIndex: number;
  width: number;
}) {
  const selected = links[selectedIndex] ?? links[0];
  const hintIndent = " ".repeat(2 + TAG_WIDTH + LABEL_WIDTH);

  return (
    <Box flexDirection="column">
      <SectionTitle
        title="Contact"
        right={`${String(selectedIndex + 1).padStart(2, "0")} / ${String(links.length).padStart(2, "0")}`}
      />

      <Box marginTop={1} flexDirection="column">
        <Text>
          <Text color={PALETTE.positive.ink}>● </Text>
          <Text color={PALETTE.ink.ink} bold>
            {PROFILE.availability}
          </Text>
        </Text>
        <Text color={PALETTE.muted.ink}>
          {PROFILE.location} · the fastest way to reach me is email.
        </Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        {links.map((link, index) => {
          const active = index === selectedIndex;
          const tag = TAGS[link.id] ?? "··";

          return (
            <Box key={link.id} flexDirection="column">
              <Text>
                {active ? (
                  <>
                    <Text color={PALETTE.accent.ink} bold>› </Text>
                    <Text color={PALETTE.accent.ink} bold>
                      {` ${tag.padEnd(TAG_WIDTH - 1)} `}
                    </Text>
                    <Text color={PALETTE.ink.ink} bold>
                      {link.label.padEnd(LABEL_WIDTH)}
                    </Text>
                    <Text color={PALETTE.accent.ink}>{link.value}</Text>
                  </>
                ) : (
                  <Text color={PALETTE.muted.ink}>
                    {`  ${tag.padEnd(TAG_WIDTH - 1)}  ${link.label.padEnd(LABEL_WIDTH)}${link.value}`}
                  </Text>
                )}
              </Text>
              {active ? (
                <Text color={PALETTE.faint.ink}>
                  {`${hintIndent}↳ ${link.description}`}
                </Text>
              ) : null}
            </Box>
          );
        })}
      </Box>

      <Text color={PALETTE.muted.ink}>
        enter or <Text color={PALETTE.accent.ink} bold>o</Text> opens the
        selected link
        {selected?.id === "email" ? (
          <>
            {"   ·   or press "}
            <Text color={PALETTE.accent.ink} bold>e</Text>
            {" anywhere"}
          </>
        ) : null}
      </Text>
    </Box>
  );
}
