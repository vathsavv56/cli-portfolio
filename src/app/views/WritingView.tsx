import { Box, Text } from "ink";
import { SectionTitle } from "../ui";
import type { WritingEntry } from "../../data/portfolio";
import { PALETTE } from "../../lib/palette";

export function WritingView({
  entries,
  selectedIndex,
}: {
  entries: WritingEntry[];
  selectedIndex: number;
  width: number;
}) {
  return (
    <Box flexDirection="column">
      <SectionTitle
        title="Writing"
        right={`${entries.length} ${entries.length === 1 ? "piece" : "pieces"}`}
      />

      <Box marginTop={1} flexDirection="column">
        {entries.map((entry, index) => {
          const active = index === selectedIndex;
          const meta = [
            entry.kind === "post" ? "blog post" : "essay",
            entry.meta.replace(/\s+·\s+/u, " · "),
          ].join(" · ");

          return (
            <Box
              key={entry.id}
              marginBottom={index === entries.length - 1 ? 0 : 1}
              flexDirection="column"
            >
              <Text>
                {active ? (
                  <>
                    <Text color={PALETTE.accent.ink} bold>› </Text>
                    <Text color={PALETTE.accent.ink}>
                      {String(index + 1).padStart(2, "0")}
                    </Text>
                    <Text color={PALETTE.ink.ink} bold>
                      {`  ${entry.title}`}
                    </Text>
                  </>
                ) : (
                  <Text color={PALETTE.muted.ink}>
                    {`  ${String(index + 1).padStart(2, "0")}  ${entry.title}`}
                  </Text>
                )}
              </Text>

              <Box marginLeft={4}>
                <Text color={PALETTE.muted.ink}>{meta}</Text>
              </Box>
              <Box marginLeft={4}>
                <Text color={PALETTE.ink.ink}>{entry.summary}</Text>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
