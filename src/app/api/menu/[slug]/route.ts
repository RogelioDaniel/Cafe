import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const CACHE_HEADERS =
  "public, s-maxage=60, stale-while-revalidate=300";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { error: "Falta el slug del producto." },
        { status: 400 }
      );
    }

    const item = await db.menuItem.findUnique({ where: { slug } });
    if (!item) {
      return NextResponse.json(
        { error: "Producto no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        item: {
          id: item.id,
          slug: item.slug,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          tags: item.tags
            ? item.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          origin: item.origin,
          popular: item.popular,
          category: item.category,
        },
      },
      { headers: { "Cache-Control": CACHE_HEADERS } }
    );
  } catch (e) {
    console.error("[api/menu/[slug]] error", e);
    return NextResponse.json(
      { error: "Algo se quemo en la cocina. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
