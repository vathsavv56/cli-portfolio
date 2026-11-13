import { Box, Text } from "ink";
import { PALETTE } from "../lib/palette";
import { PROFILE, SECTIONS, type SectionId } from "../data/portfolio";

/** A key hint for the statusline footer. */
export interface FooterHint {
  /** The key to press, if any. Rendered as an accent glyph. */
  key?: string;
  label: string;
}

export function Rule({ width }: { width: number }) {
  const total = Math.max(1, width);
  const head = Math.round(total * 0.6);
  const mid = Math.round((total - head) * 0.5);

  return (
    <Text>
      <Text color={PALETTE.frame.ink}>{"─".repeat(head)}</Text>
      <Text color={PALETTE.frameSoft.ink}>{"─".repeat(mid)}</Text>
      <Text color={PALETTE.frameDeep.ink}>{"─".repeat(total - head - mid)}</Text>
    </Text>
  );
}

function BrandChip() {
  return (
    <Text color="whiteBright" backgroundColor={PALETTE.accent.ink} bold>
      {" v56 "}
    </Text>
  );
}

export function Header({ section, width }: { section: SectionId; width: number }) {
  const compact = width < 66;

  return (
    <Box flexDirection="column">
      <Box paddingX={2} justifyContent="space-between">
        <Text>
          <BrandChip />
          <Text color={PALETTE.ink.ink} bold>
            {"  Vathsav Inavolu"}
          </Text>
          {!compact ? (
            <Text color={PALETTE.muted.ink}> · terminal portfolio</Text>
          ) : null}
        </Text>
        {width >= 68 ? (
          <Text color={PALETTE.muted.ink}>{PROFILE.location}</Text>
        ) : null}
      </Box>

      <Box paddingX={2} marginTop={0}>
        {width < 56 ? (
          <>
            <Text color="whiteBright" backgroundColor={PALETTE.accent.ink} bold>
              {` ${SECTIONS.find((item) => item.id === section)?.shortLabel ?? section} `}
            </Text>
            <Text color={PALETTE.muted.ink}>  1–4 switch</Text>
          </>
        ) : (
          SECTIONS.map((item, index) => {
            const active = item.id === section;
            const label = ` ${item.key} ${compact ? item.shortLabel : item.label} `;
            return (
              <Box key={item.id}>
                {index > 0 ? (
                  <Text color={PALETTE.faint.ink}>{" │ "}</Text>
                ) : null}
                {active ? (
                  <Text
                    color="whiteBright"
                    backgroundColor={PALETTE.accent.ink}
                    bold
                  >
                    {label}
                  </Text>
                ) : (
                  <Text color={PALETTE.muted.ink}>{label}</Text>
                )}
              </Box>
            );
          })
        )}
      </Box>

      <Box paddingX={2} marginTop={0}>
        <Rule width={width - 4} />
      </Box>
    </Box>
  );
}

export function Footer({
  mode,
  hints,
  width,
  notice,
}: {
  mode: string;
  hints: FooterHint[];
  width: number;
  notice?: string | null;
}) {
  return (
    <Box flexDirection="column">
      <Box paddingX={2}>
        <Rule width={width - 4} />
      </Box>
      <Box paddingX={2} justifyContent="space-between">
        {notice ? (
          <Text color={PALETTE.negative.ink}>
            <Text bold>✕</Text>
            {` ${notice}`}
          </Text>
        ) : (
          <Text>
            <Text color="whiteBright" backgroundColor={PALETTE.accent.ink} bold>
              {` ${mode} `}
            </Text>
            <Text color={PALETTE.muted.ink}>{"  v56"}</Text>
          </Text>
        )}

        {width >= 80 ? (
          <Text>
            <Hints hints={hints} />
            <Text color={PALETTE.faint.ink}>{"   ·   Jai Sri Ram"}</Text>
          </Text>
        ) : (
          <Hints hints={hints} />
        )}
      </Box>
    </Box>
  );
}

function Hints({ hints }: { hints: FooterHint[] }) {
  if (hints.length === 0) return <Text color={PALETTE.muted.ink}> </Text>;

  return (
    <Text>
      {hints.map((hint, index) => {
        const separator =
          index > 0 ? <Text color={PALETTE.faint.ink}>{"  ·  "}</Text> : null;
        return (
          <Text key={hint.key ?? hint.label}>
            {separator}
            {hint.key ? (
              <>
                <Text color={PALETTE.accent.ink} bold>
                  {hint.key}
                </Text>
                <Text color={PALETTE.muted.ink}>{` ${hint.label}`}</Text>
              </>
            ) : (
              <Text color={PALETTE.muted.ink}>{hint.label}</Text>
            )}
          </Text>
        );
      })}
    </Text>
  );
}

export function SectionTitle({
  title,
  right,
}: {
  title: string;
  right?: string;
}) {
  return (
    <Box justifyContent="space-between" alignItems="center">
      <Text>
        <Text color={PALETTE.accent.ink}>▌ </Text>
        <Text color={PALETTE.ink.ink} bold>
          {title}
        </Text>
      </Text>
      {right ? <Text color={PALETTE.muted.ink}>{right}</Text> : null}
    </Box>
  );
}
