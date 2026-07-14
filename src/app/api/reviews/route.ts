import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const CACHE_HEADERS = "public, s-maxage=300";

export async function GET() {
  try {
    const reviews = await db.review.findMany({
      where: { visible: true },
      orderBy: { sort: "asc" },
    });

    return NextResponse.json(
      {
        reviews: reviews.map((r) => ({
          id: r.id,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          source: r.source,
          createdAt: r.createdAt,
        })),
      },
      { headers: { "Cache-Control": CACHE_HEADERS } }
    );
  } catch (e) {
    console.error("[api/reviews] error", e);
    return NextResponse.json(
      { error: "Algo se quemo en la cocina. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
