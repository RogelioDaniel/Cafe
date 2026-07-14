import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type OrderInputItem = { slug?: string; qty?: number };

type StoredOrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

const TIME_RE = /^\d{2}:\d{2}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const {
      customerName,
      customerPhone,
      items,
      pickupTime,
      notes,
    } = body || {};

    if (
      !customerName ||
      typeof customerName !== "string" ||
      !customerName.trim()
    ) {
      return NextResponse.json(
        { error: "Tu nombre es obligatorio." },
        { status: 400 }
      );
    }
    if (
      !customerPhone ||
      typeof customerPhone !== "string" ||
      !customerPhone.trim()
    ) {
      return NextResponse.json(
        { error: "Tu teléfono es obligatorio." },
        { status: 400 }
      );
    }
    if (!pickupTime || typeof pickupTime !== "string" || !TIME_RE.test(pickupTime)) {
      return NextResponse.json(
        { error: "Hora de recolección inválida (formato HH:mm)." },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Tu carrito está vacío." },
        { status: 400 }
      );
    }

    // Look up each item by slug to get the current canonical price
    const slugs = items
      .map((i: OrderInputItem) => i?.slug)
      .filter((s): s is string => Boolean(s));
    const dbItems = await db.menuItem.findMany({
      where: { slug: { in: slugs } },
    });
    const itemMap = new Map(dbItems.map((i) => [i.slug, i]));

    const storedItems: StoredOrderItem[] = [];
    let total = 0;
    let cafeCups = 0;

    for (const input of items as OrderInputItem[]) {
      const dbItem = itemMap.get(input?.slug || "");
      if (!dbItem) continue;
      const qty = Math.max(1, Math.floor(Number(input?.qty) || 1));
      storedItems.push({
        id: dbItem.id,
        name: dbItem.name,
        price: dbItem.price,
        qty,
      });
      total += dbItem.price * qty;
      if (dbItem.category === "cafe-de-olla") {
        cafeCups += qty;
      }
    }

    if (storedItems.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron productos válidos en tu carrito." },
        { status: 400 }
      );
    }

    const order = await db.order.create({
      data: {
        status: "pending",
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: JSON.stringify(storedItems),
        total,
        pickupTime,
        notes:
          typeof notes === "string" && notes.trim()
            ? notes.trim()
            : null,
      },
    });

    // Increment live stats counters (orders_today always, cups_today only when
    // the order contains café-de-olla items)
    await Promise.all([
      db.statsCounter.upsert({
        where: { id: "orders_today" },
        update: { value: { increment: 1 } },
        create: { id: "orders_today", value: 1 },
      }),
      cafeCups > 0
        ? db.statsCounter.upsert({
            where: { id: "cups_today" },
            update: { value: { increment: cafeCups } },
            create: { id: "cups_today", value: cafeCups },
          })
        : Promise.resolve(),
    ]);

    return NextResponse.json(
      {
        ok: true,
        order: {
          id: order.id,
          status: order.status,
          total: order.total,
          pickupTime: order.pickupTime,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("[api/cart/order] error", e);
    return NextResponse.json(
      { error: "Algo se quemo en la cocina. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
