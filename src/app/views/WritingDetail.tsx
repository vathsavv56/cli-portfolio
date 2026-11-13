import { useEffect, useMemo, useState } from "react";
import { Text, Box } from "ink";
import type { WritingEntry } from "../../data/portfolio";
import {
  philosophyBlocks,
  postBlocks,
  postHeaderBlocks,
  postUnavailableBlocks,
} from "../../content/blocks";
import { fetchBlogMarkdown } from "../../lib/blog";
import { type DocBlock } from "../../lib/document";
import { Document } from "../Document";
import { Spinner } from "../Spinner";
import { PALETTE } from "../../lib/palette";

type DetailState =
  | { status: "loading" }
  | { status: "ready"; blocks: DocBlock[] }
  | { status: "error"; message: string };

export function WritingDetail({
  entry,
  width,
  maxLines,
  page,
  onPageCount,
}: {
  entry: WritingEntry;
  width: number;
  maxLines: number;
  page: number;
  onPageCount: (count: number) => void;
}) {
  const [state, setState] = useState<DetailState>(() =>
    entry.kind === "essay"
      ? { status: "ready", blocks: philosophyBlocks() }
      : { status: "loading" },
  );

  useEffect(() => {
    if (entry.kind === "essay") {
      setState({ status: "ready", blocks: philosophyBlocks() });
      return;
    }

    const slug = entry.slug;
    if (!slug) {
      setState({ status: "error", message: "No source link for this post." });
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    setState({ status: "loading" });

    fetchBlogMarkdown(slug, { signal: controller.signal })
      .then((markdown) => {
        if (!cancelled) {
          setState({ status: "ready", blocks: postBlocks(entry, markdown) });
        }
      })
      .catch((error: unknown) => {
        if (cancelled || (error as Error)?.name === "AbortError") return;
        setState({
          status: "error",
          message:
            "The post could not be fetched. Check your connection, or press o to read it online.",
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [entry]);

  const blocks = useMemo(() => {
    if (state.status === "loading") {
      return postHeaderBlocks(entry);
    }

    if (state.status === "error") {
      return postUnavailableBlocks(entry, state.message);
    }

    return state.blocks;
  }, [entry, state]);

  return (
    <Box flexDirection="column">
      {state.status === "loading" ? (
        <Box marginBottom={1}>
          <Spinner color={PALETTE.accent.ink} />
          <Text color={PALETTE.muted.ink}>
            {" Fetching the post from the portfolio's blog source…"}
          </Text>
        </Box>
      ) : null}
      <Document
        blocks={blocks}
        width={width}
        maxLines={maxLines}
        page={page}
        onPageCount={onPageCount}
      />
    </Box>
  );
}
