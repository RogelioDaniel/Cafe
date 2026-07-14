import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const rows = await db.statsCounter.findMany();
    const stats: Record<string, number> = {};
    for (const row of rows) {
      stats[row.id] = row.value;
    }

    return NextResponse.json(
      {
        cups_today: stats.cups_today ?? 0,
        orders_today: stats.orders_today ?? 0,
        reservations_today: stats.reservations_today ?? 0,
        happy_customers: stats.happy_customers ?? 0,
        viewers_now: stats.viewers_now ?? 0,
        timestamp: Date.now(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("[api/stats] error", e);
    return NextResponse.json(
      { error: "Algo se quemo en la cocina. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
