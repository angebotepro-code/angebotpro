"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  running: boolean;
}

export function RecordingTimer({ running }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      setElapsed(0);
      intervalRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  if (!running && elapsed === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm tabular-nums text-muted-foreground">
      {running && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
      <span>{formatted}</span>
    </div>
  );
}
