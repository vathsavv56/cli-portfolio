import { useEffect, useState } from "react";
import { useStdout } from "ink";

export interface TerminalSize {
  columns: number;
  rows: number;
}

export interface TerminalSizeOverride {
  columns?: number;
  rows?: number;
}

export function useTerminalSize(override?: TerminalSizeOverride): TerminalSize {
  const { stdout } = useStdout();
  const [live, setLive] = useState<TerminalSize>({
    columns: stdout.columns ?? 80,
    rows: stdout.rows ?? 24,
  });

  useEffect(() => {
    const read = () => {
      setLive({
        columns: stdout.columns ?? 80,
        rows: stdout.rows ?? 24,
      });
    };

    read();
    stdout.on("resize", read);
    return () => {
      stdout.off("resize", read);
    };
  }, [stdout]);

  return {
    columns: override?.columns ?? live.columns,
    rows: override?.rows ?? live.rows,
  };
}
