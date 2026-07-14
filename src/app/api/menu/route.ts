import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const CATEGORY_NAMES: Record<string, string> = {
  "cafe-de-olla": "Café de Olla",
  antojitos: "Antojitos",
  "pan-dulce": "Pan Dulce",
  postres: "Postres",
  bebidas: "Bebidas",
};

const CATEGORY_ORDER = [
  "cafe-de-olla",
  "antojitos",
  "pan-dulce",
  "postres",
  "bebidas",
];

const CACHE_HEADERS =
  "public, s-maxage=60, stale-while-revalidate=300";

type PublicItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  tags: string[];
  origin: string | null;
  popular: boolean;
  category: string;
};

function transformItem(item: {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  tags: string;
  origin: string | null;
  popular: boolean;
  category: string;
}): PublicItem {
  return {
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
  };
}

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get("category");
    const where = category ? { category, available: true } : { available: true };

    const items = await db.menuItem.findMany({
      where,
      orderBy: [{ sort: "asc" }, { name: "asc" }],
    });

    const transformedItems = items.map(transformItem);

    // Group by category preserving the canonical order
    const groupedMap = new Map<string, PublicItem[]>();
    for (const item of transformedItems) {
      if (!groupedMap.has(item.category)) groupedMap.set(item.category, []);
      groupedMap.get(item.category)!.push(item);
    }

    const categories = CATEGORY_ORDER.filter((cat) =>
      groupedMap.has(cat)
    ).map((cat) => ({
      id: cat,
      name: CATEGORY_NAMES[cat] || cat,
      items: groupedMap.get(cat) || [],
    }));

    // If a category filter is applied but doesn't belong to the canonical
    // order (unlikely), still surface it at the end so the UI doesn't break.
    for (const cat of groupedMap.keys()) {
      if (!CATEGORY_ORDER.includes(cat)) {
        categories.push({
          id: cat,
          name: CATEGORY_NAMES[cat] || cat,
          items: groupedMap.get(cat) || [],
        });
      }
    }

    return NextResponse.json(
      { categories, items: transformedItems },
      { headers: { "Cache-Control": CACHE_HEADERS } }
    );
  } catch (e) {
    console.error("[api/menu] error", e);
    return NextResponse.json(
      { error: "Algo se quemo en la cocina. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
