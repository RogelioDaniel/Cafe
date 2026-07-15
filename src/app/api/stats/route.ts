import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const FALLBACK_STATS = {
  cups_today: 1847,
  orders_today: 312,
  reservations_today: 48,
  happy_customers: 28493,
  viewers_now: 23,
};

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
    // The live counters are presentational. If a serverless runtime cannot
    // open the bundled SQLite snapshot, keep the page useful instead of
    // repeatedly surfacing a 500 error in every client that polls this route.
    return NextResponse.json(
      { ...FALLBACK_STATS, timestamp: Date.now(), source: "fallback" },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Cafe-Data-Source": "fallback",
        },
      }
    );
  }
}
