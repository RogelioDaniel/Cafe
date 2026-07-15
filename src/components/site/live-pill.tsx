"use client";

import { useEffect, useState } from "react";
import { useCafeStats } from "@/hooks/use-cafe-stats";
import { formatNumber } from "@/lib/format";

/**
 * Live indicator pill — shows "X personas viendo ahora" with a pulsing dot.
 * Conveys high-traffic / alta concurrencia feel.
 */
export function LivePill() {
  const { state, connected } = useCafeStats();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!state) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 600);
    return () => clearTimeout(t);
  }, [state?.viewers_now]);

  const viewers = state?.viewers_now ?? 0;

  return (
    <div
      className={`hidden items-center gap-1.5 rounded-full border-2 border-[#1d2059] bg-[#fff8d8] px-2.5 py-1 text-xs font-extrabold text-[#1d2059] transition-all lg:flex ${
        pulse ? "ring-2 ring-[#f3df4d]" : ""
      }`}
      title={connected ? "Conectado en tiempo real" : "Reconectando…"}
    >
      <span className="relative flex h-2 w-2">
        {connected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            connected ? "bg-accent" : "bg-muted-foreground"
          }`}
        />
      </span>
      <span className="tabular-nums">{formatNumber(viewers)}</span>
      <span className="hidden xl:inline">viendo ahora</span>
    </div>
  );
}
