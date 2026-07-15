import { db } from "@/lib/db";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { LiveStatsBar } from "@/components/site/live-stats-bar";
import { MenuSection } from "@/components/site/menu-section";
import { Provenance } from "@/components/site/provenance";
import { Reservation } from "@/components/site/reservation";
import { Testimonials } from "@/components/site/testimonials";
import { LocationSection } from "@/components/site/location";
import { SiteFooter } from "@/components/site/site-footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { AIBarista } from "@/components/site/ai-barista";
import { CoffeeIntro } from "@/components/site/coffee-intro";
import { CoffeeRitual } from "@/components/site/coffee-ritual";
import { CoffeeSectionTransition } from "@/components/site/coffee-section-transition";
import type { MenuCategoryGroup, MenuItem, MenuCategory, Review } from "@/lib/types";

const CATEGORY_NAMES: Record<MenuCategory, string> = {
  "cafe-de-olla": "Café de Olla",
  antojitos: "Antojitos",
  "pan-dulce": "Pan Dulce",
  postres: "Postres",
  bebidas: "Bebidas",
};

const CATEGORY_ORDER: MenuCategory[] = [
  "cafe-de-olla",
  "antojitos",
  "pan-dulce",
  "postres",
  "bebidas",
];

export const revalidate = 60; // ISR — revalidate menu/reviews every 60s

export default async function Home() {
  // Fetch menu + reviews in parallel for SSR
  const [menuItems, reviews] = await Promise.all([
    db.menuItem.findMany({
      where: { available: true },
      orderBy: [{ sort: "asc" }, { name: "asc" }],
    }),
    db.review.findMany({
      where: { visible: true },
      orderBy: { sort: "asc" },
      take: 8,
    }),
  ]);

  // Group menu by category
  const categoryMap = new Map<MenuCategory, MenuItem[]>();
  for (const item of menuItems) {
    const cat = item.category as MenuCategory;
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    const mapped: MenuItem = {
      id: item.id,
      slug: item.slug,
      name: item.name,
      description: item.description,
      price: item.price,
      category: cat,
      image: item.image,
      tags: item.tags ? item.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      origin: item.origin,
      popular: item.popular,
    };
    categoryMap.get(cat)!.push(mapped);
  }

  const categories: MenuCategoryGroup[] = CATEGORY_ORDER.filter((c) =>
    categoryMap.has(c)
  ).map((c) => ({
    id: c,
    name: CATEGORY_NAMES[c],
    items: categoryMap.get(c)!,
  }));

  const initialReviews: Review[] = reviews.map((r) => ({
    id: r.id,
    name: r.name,
    rating: r.rating,
    comment: r.comment,
    source: r.source,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <>
      <CoffeeIntro />
      <div className="tonalli-site-stage">
        <div className="tonalli-site-canvas">
          <Navbar />
          <main id="main-content" className="flex-1">
            <Hero />
            <LiveStatsBar />
            <CoffeeSectionTransition from="maiz" to="noche" label="La carta sale al comal" />
            <MenuSection categories={categories} />
            <CoffeeSectionTransition from="noche" to="barro" label="El barro guarda el calor" />
            <CoffeeRitual />
            <CoffeeSectionTransition from="barro" to="azul" label="Del metate a la memoria" />
            <Provenance />
            <CoffeeSectionTransition from="azul" to="crema" label="Aparta tu sobremesa" />
            <Reservation />
            <CoffeeSectionTransition from="crema" to="noche" label="Lo cuenta la colonia" />
            <Testimonials initialReviews={initialReviews} />
            <CoffeeSectionTransition from="noche" to="hoja" label="Nos vemos en la Roma" />
            <LocationSection />
          </main>
          <SiteFooter />
        </div>
      </div>

      {/* Overlays */}
      <CartDrawer />
      <AIBarista />
    </>
  );
}
