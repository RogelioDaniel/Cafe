"use client";

import { Coffee, Users, UtensilsCrossed, Clock } from "lucide-react";
import { useCafeStats } from "@/hooks/use-cafe-stats";
import { formatNumber } from "@/lib/format";

/**
 * Live stats marquee — scrolls horizontally, conveys alta concurrencia.
 */
export function LiveStatsBar() {
  const { state, connected } = useCafeStats();

  const items = [
    {
      icon: Coffee,
      label: "Tazas servidas hoy",
      value: state?.cups_today ?? 0,
    },
    {
      icon: UtensilsCrossed,
      label: "Órdenes hoy",
      value: state?.orders_today ?? 0,
    },
    {
      icon: Users,
      label: "Reservas hoy",
      value: state?.reservations_today ?? 0,
    },
    {
      icon: Clock,
      label: "Espera aprox.",
      value: `${state?.wait_time_minutes ?? 8} min`,
    },
    {
      icon: Users,
      label: "Viendo ahora",
      value: state?.viewers_now ?? 0,
    },
  ];

  // Duplicate for seamless marquee loop
  const looped = [...items, ...items];

  return (
    <section
      className="border-y border-border bg-secondary/40 py-3"
      aria-label="Estadísticas en vivo"
    >
      <div className="relative flex overflow-hidden">
        <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
          {looped.map((item, i) => (
            <StatChip key={i} {...item} connected={connected} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  connected,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  connected: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 whitespace-nowrap">
      <Icon className="h-4 w-4 text-primary" />
      <span className="font-display text-base font-semibold tabular-nums text-foreground">
        {typeof value === "number" ? formatNumber(value) : value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="ml-2 inline-flex h-1.5 w-1.5 rounded-full bg-accent">
        {connected && (
          <span className="inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
        )}
      </span>
    </div>
  );
}
