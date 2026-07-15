import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const MAX_PER_SLOT = 4;
const OPEN_HOUR = 7;
const CLOSE_HOUR = 22;
const MONTH_RE = /^\d{4}-\d{2}$/;

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

function isHalfHourSlot(time: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(time) || !inOpeningHours(time)) return false;
  const minutes = Number(time.split(":")[1]);
  return minutes === 0 || minutes === 30;
}

function getFallbackMonthAvailability(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();

  return Array.from({ length: daysInMonth }, (_, index) => ({
    date: `${month}-${String(index + 1).padStart(2, "0")}`,
    slotsLeft: MAX_PER_SLOT,
    status: "available" as const,
  }));
}

async function getMonthAvailability(month: string, time: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const nextMonthDate = new Date(Date.UTC(year, monthNumber, 1));
  const nextMonth = `${nextMonthDate.getUTCFullYear()}-${String(
    nextMonthDate.getUTCMonth() + 1
  ).padStart(2, "0")}`;

  const reservations = await db.reservation.findMany({
    where: {
      date: { gte: `${month}-01`, lt: `${nextMonth}-01` },
      time,
      status: { not: "cancelled" },
    },
    select: { date: true },
  });

  const counts = reservations.reduce<Map<string, number>>((map, reservation) => {
    map.set(reservation.date, (map.get(reservation.date) ?? 0) + 1);
    return map;
  }, new Map());

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = `${month}-${String(index + 1).padStart(2, "0")}`;
    const slotsLeft = Math.max(0, MAX_PER_SLOT - (counts.get(date) ?? 0));
    return {
      date,
      slotsLeft,
      status:
        slotsLeft === 0 ? "full" : slotsLeft === 1 ? "limited" : "available",
    };
  });
}

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    const time = req.nextUrl.searchParams.get("time");
    const month = req.nextUrl.searchParams.get("month");
    // partySize is accepted but the slot limit is per-reservation, not per-person.
    // We surface it for the UI; it does not change `slotsLeft`.
    const _partySize = req.nextUrl.searchParams.get("partySize");

    if (month) {
      if (!MONTH_RE.test(month) || !time || !isHalfHourSlot(time)) {
        return NextResponse.json(
          { error: "Mes u horario inválido." },
          { status: 400 }
        );
      }

      const days = await getMonthAvailability(month, time);
      return NextResponse.json({ month, time, days });
    }

    if (!date || !time || !isHalfHourSlot(time)) {
      return NextResponse.json(
        { error: "Los parámetros date y time son obligatorios y deben ser válidos." },
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
    // Availability is a read-only aid. Vercel functions can be deployed
    // without the local SQLite snapshot, so degrade to an open calendar
    // rather than flooding the visitor's console with 500 responses.
    const month = req.nextUrl.searchParams.get("month");
    const time = req.nextUrl.searchParams.get("time");

    if (month && MONTH_RE.test(month) && time && isHalfHourSlot(time)) {
      return NextResponse.json(
        { month, time, days: getFallbackMonthAvailability(month), source: "fallback" },
        { headers: { "Cache-Control": "no-store", "X-Cafe-Data-Source": "fallback" } }
      );
    }

    return NextResponse.json(
      { available: true, slotsLeft: MAX_PER_SLOT, alternativeTimes: [], source: "fallback" },
      { headers: { "Cache-Control": "no-store", "X-Cafe-Data-Source": "fallback" } }
    );
  }
}
