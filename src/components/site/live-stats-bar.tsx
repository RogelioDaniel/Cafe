"use client";

import { Coffee, Users, UtensilsCrossed, Clock } from "lucide-react";
import { useCafeStats } from "@/hooks/use-cafe-stats";
import { formatNumber } from "@/lib/format";

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

  return (
    <section
      className="bar-ticket relative border-y border-border bg-card"
      aria-label="Estadísticas en vivo"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 md:grid-cols-5 lg:px-8">
        {items.map((item) => (
          <StatChip key={item.label} {...item} />
        ))}
      </div>
      <div className="border-t border-border bg-secondary/45 py-2 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="coffee-bean-mark" aria-hidden="true" />
          {connected ? "La barra está reportando en vivo" : "Último corte de la barra"}
          <span className="coffee-bean-mark" aria-hidden="true" />
        </span>
      </div>
    </section>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex min-h-20 items-center gap-2.5 border-b border-r border-border px-3 py-4 even:border-r-0 md:border-b-0 md:border-r md:even:border-r md:last:border-r-0">
      <Icon className="h-4 w-4 text-primary" />
      <span>
        <span className="block font-display text-lg font-semibold tabular-nums text-foreground">
          {typeof value === "number" ? formatNumber(value) : value}
        </span>
        <span className="block text-[11px] leading-tight text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}
