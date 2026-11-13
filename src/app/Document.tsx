import { Box, Text } from "ink";
import { useEffect, useMemo } from "react";
import {
  layoutBlocks,
  paginateLines,
  type DocBlock,
  type Line,
} from "../lib/document";
import { PALETTE } from "../lib/palette";

export function InkLine({ line }: { line: Line }) {
  if (line.length === 0) {
    return <Text> </Text>;
  }

  return (
    <Text>
      {line.map((part, index) => (
        <Text
          key={`${index}-${part.text.slice(0, 8)}`}
          bold={part.bold}
          color={part.color ? PALETTE[part.color].ink : undefined}
          dimColor={part.dim}
          italic={part.italic}
          underline={part.underline}
          inverse={part.inverse}
        >
          {part.text}
        </Text>
      ))}
    </Text>
  );
}

export function Document({
  blocks,
  width,
  maxLines,
  page,
  onPageCount,
}: {
  blocks: DocBlock[];
  width: number;
  maxLines: number;
  page: number;
  onPageCount: (count: number) => void;
}) {
  const lines = useMemo(() => layoutBlocks(blocks, width), [blocks, width]);
  const pages = useMemo(
    () => paginateLines(lines, Math.max(1, maxLines)),
    [lines, maxLines],
  );

  useEffect(() => {
    onPageCount(pages.length);
  }, [onPageCount, pages.length]);

  const current = pages[Math.min(page, pages.length - 1)] ?? [];

  return (
    <Box flexDirection="column">
      {current.map((line, index) => (
        <InkLine key={index} line={line} />
      ))}
    </Box>
  );
}
