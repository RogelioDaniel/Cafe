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
      className="bar-ticket live-poster-grid relative"
      aria-label="Estadísticas en vivo"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-6 sm:px-6 md:grid-cols-5 lg:px-8">
        {items.map((item) => (
          <StatChip key={item.label} {...item} />
        ))}
      </div>
      <div className="border-t-2 border-[#1d2059] bg-[#fff8d8] py-2 text-center font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1d2059]">
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
    <div className="live-poster-stat flex min-h-20 items-center gap-2.5 px-3 py-4">
      <Icon className="h-5 w-5 shrink-0 text-[#1d2059]" strokeWidth={2.7} />
      <span>
        <span className="block font-display text-lg tabular-nums text-[#1d2059]">
          {typeof value === "number" ? formatNumber(value) : value}
        </span>
        <span className="block text-[11px] font-bold leading-tight text-[#1d2059]/75">{label}</span>
      </span>
    </div>
  );
}
