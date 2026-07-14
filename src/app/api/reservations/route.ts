import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const MAX_PER_SLOT = 4;
const OPEN_HOUR = 7; // 07:00
const CLOSE_HOUR = 22; // hasta 22:00 (última sentada)
const TIME_RE = /^\d{2}:\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_ZONES = ["sala", "terraza", "barra"] as const;
type TableZone = (typeof VALID_ZONES)[number];

function isTimeValid(time: string): boolean {
  if (!TIME_RE.test(time)) return false;
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (h < OPEN_HOUR || h >= CLOSE_HOUR) return false;
  if (m < 0 || m > 59) return false;
  return true;
}

function isDateValid(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const d = new Date(`${date}T00:00:00`);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const {
      name,
      phone,
      email,
      partySize,
      date,
      time,
      tableZone,
      specialRequests,
    } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Tu nombre es obligatorio." },
        { status: 400 }
      );
    }
    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "Tu teléfono es obligatorio." },
        { status: 400 }
      );
    }
    if (!date || !isDateValid(date)) {
      return NextResponse.json(
        { error: "Fecha inválida o en el pasado." },
        { status: 400 }
      );
    }
    if (!time || !isTimeValid(time)) {
      return NextResponse.json(
        { error: "Horario inválido (abrimos 07:00–22:00)." },
        { status: 400 }
      );
    }
    const party = Number(partySize);
    if (!Number.isFinite(party) || party < 1 || party > 12) {
      return NextResponse.json(
        { error: "Número de comensales inválido (1–12)." },
        { status: 400 }
      );
    }

    const zone: TableZone =
      typeof tableZone === "string" && (VALID_ZONES as readonly string[]).includes(tableZone)
        ? (tableZone as TableZone)
        : "sala";

    // Availability check: max MAX_PER_SLOT active reservations per slot
    const existing = await db.reservation.count({
      where: { date, time, status: { not: "cancelled" } },
    });
    if (existing >= MAX_PER_SLOT) {
      return NextResponse.json(
        { error: "Ese horario está lleno. Intenta 30 minutos después." },
        { status: 409 }
      );
    }

    const reservation = await db.reservation.create({
      data: {
        status: "confirmed",
        name: name.trim(),
        phone: phone.trim(),
        email:
          typeof email === "string" && email.trim() ? email.trim() : null,
        partySize: party,
        date,
        time,
        tableZone: zone,
        specialRequests:
          typeof specialRequests === "string" && specialRequests.trim()
            ? specialRequests.trim()
            : null,
      },
    });

    await db.statsCounter.upsert({
      where: { id: "reservations_today" },
      update: { value: { increment: 1 } },
      create: { id: "reservations_today", value: 1 },
    });

    return NextResponse.json({
      ok: true,
      reservation: {
        id: reservation.id,
        name: reservation.name,
        partySize: reservation.partySize,
        date: reservation.date,
        time: reservation.time,
        tableZone: reservation.tableZone,
        status: reservation.status,
      },
    });
  } catch (e) {
    console.error("[api/reservations POST] error", e);
    return NextResponse.json(
      { error: "Algo se quemo en la cocina. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reservations = await db.reservation.findMany({
      where: { status: { not: "cancelled" } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        partySize: true,
        date: true,
        time: true,
        status: true,
      },
    });
    return NextResponse.json({ reservations });
  } catch (e) {
    console.error("[api/reservations GET] error", e);
    return NextResponse.json(
      { error: "Algo se quemo en la cocina. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
