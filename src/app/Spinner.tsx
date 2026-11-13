import { Text } from "ink";
import { useEffect, useState } from "react";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const INTERVAL_MS = 80;

/**
 * A minimal braille spinner. Ink 6 has no built-in Spinner component, and the
 * fetch flow only needs one, so this keeps the dependency surface at zero.
 */
export function Spinner({ color }: { color?: string }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((current) => (current + 1) % FRAMES.length);
    }, INTERVAL_MS);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return <Text color={color}>{FRAMES[frame]}</Text>;
}
