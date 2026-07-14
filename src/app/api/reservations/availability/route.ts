import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const MAX_PER_SLOT = 4;
const OPEN_HOUR = 7;
const CLOSE_HOUR = 22;

function addMinutes(time: string, minutes: number): string {
  const [hStr, mStr] = time.split(":").map(Number);
  const total = hStr * 60 + mStr + minutes;
  // Wrap inside a day, clamp into opening hours window
  let newH = Math.floor(total / 60) % 24;
  let newM = total % 60;
  if (newM < 0) {
    newM += 60;
    newH -= 1;
  }
  if (newH < 0) newH += 24;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function inOpeningHours(time: string): boolean {
  const [hStr] = time.split(":");
  const h = Number(hStr);
  return h >= OPEN_HOUR && h < CLOSE_HOUR;
}

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    const time = req.nextUrl.searchParams.get("time");
    // partySize is accepted but the slot limit is per-reservation, not per-person.
    // We surface it for the UI; it does not change `slotsLeft`.
    const _partySize = req.nextUrl.searchParams.get("partySize");

    if (!date || !time) {
      return NextResponse.json(
        { error: "Los parámetros date y time son obligatorios." },
        { status: 400 }
      );
    }

    const existing = await db.reservation.count({
      where: { date, time, status: { not: "cancelled" } },
    });

    const slotsLeft = Math.max(0, MAX_PER_SLOT - existing);
    const available = slotsLeft > 0;

    let alternativeTimes: string[] = [];
    if (!available) {
      // Search the next 3 available 30-min slots within opening hours
      const found: string[] = [];
      let candidate = time;
      for (let i = 0; i < 48 && found.length < 3; i++) {
        candidate = addMinutes(candidate, 30);
        if (!inOpeningHours(candidate)) continue;
        const count = await db.reservation.count({
          where: { date, time: candidate, status: { not: "cancelled" } },
        });
        if (count < MAX_PER_SLOT) {
          found.push(candidate);
        }
      }
      alternativeTimes = found;
    }

    return NextResponse.json({
      available,
      slotsLeft,
      alternativeTimes,
    });
  } catch (e) {
    console.error("[api/reservations/availability] error", e);
    return NextResponse.json(
      { error: "Algo se quemo en la cocina. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
