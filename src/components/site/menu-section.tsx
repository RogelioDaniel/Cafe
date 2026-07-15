"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus, Flame, Sparkles, Leaf } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-store";
import { formatMXN } from "@/lib/format";
import { toast } from "sonner";
import type { MenuCategoryGroup, MenuItem, MenuCategory } from "@/lib/types";

interface MenuSectionProps {
  categories: MenuCategoryGroup[];
}

const TAG_META: Record<string, { icon?: React.ElementType; className: string; label: string }> = {
  popular: { icon: Flame, className: "bg-accent/15 text-accent border-accent/30", label: "Popular" },
  nuevo: { icon: Sparkles, className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30", label: "Nuevo" },
  vegano: { icon: Leaf, className: "bg-green-700/10 text-green-800 dark:text-green-400 border-green-700/25", label: "Vegano" },
  "sin-gluten": { className: "bg-primary/10 text-primary border-primary/25", label: "Sin gluten" },
  picante: { icon: Flame, className: "bg-red-700/10 text-red-700 dark:text-red-400 border-red-700/25", label: "Picante" },
  clasico: { className: "bg-secondary text-secondary-foreground border-border", label: "Clásico" },
  "de-autor": { icon: Sparkles, className: "bg-amber-600/15 text-amber-800 dark:text-amber-300 border-amber-600/30", label: "De autor" },
};

export function MenuSection({ categories }: MenuSectionProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<MenuCategory | "todos">("todos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let cats = categories;
    if (active !== "todos") {
      cats = cats.filter((c) => c.id === active);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      cats = cats
        .map((c) => ({
          ...c,
          items: c.items.filter(
            (it) =>
              it.name.toLowerCase().includes(q) ||
              it.description.toLowerCase().includes(q) ||
              (it.origin ?? "").toLowerCase().includes(q)
          ),
        }))
        .filter((c) => c.items.length > 0);
    }
    return cats;
  }, [categories, active, query]);

  const totalItems = categories.reduce((a, c) => a + c.items.length, 0);

  return (
    <section id="menu" className="menu-section relative scroll-mt-20 overflow-hidden bg-background py-20 sm:py-28">
      <div className="menu-stain pointer-events-none absolute -right-32 top-32 h-96 w-96 opacity-30" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative grid items-end gap-7 border-b border-foreground/20 pb-9 lg:grid-cols-[1fr_0.72fr]">
          <div className="menu-order-slip" aria-hidden="true">
            <span>Comanda de la casa</span>
            <strong>Barra abierta · 07:00</strong>
          </div>
          <div>
            <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
              <span className="coffee-bean-mark" aria-hidden="true" />
              La carta
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
              Antojos hechos
              <br />
              <span className="font-normal italic text-primary">al ritmo del comal.</span>
            </h2>
          </div>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground lg:pb-1 lg:text-lg">
            Café tostado cada mañana, masa nixtamalizada en casa y pan dulce
            que sale antes de que el barrio abra los ojos. Cada ingrediente
            dice de dónde viene.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <FilterChip
              active={active === "todos"}
              onClick={() => setActive("todos")}
            >
              Todo ({totalItems})
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c.id}
                active={active === c.id}
                onClick={() => setActive(c.id)}
              >
                {c.name} ({c.items.length})
              </FilterChip>
            ))}
          </div>

          {/* Search */}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en el menú… (ej. café, tamal, picante)"
            className="w-full max-w-md rounded-full border border-border bg-card px-5 py-2.5 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-label="Buscar en el menú"
          />
        </div>

        {/* Grid */}
        <div className="mt-12 space-y-16">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.p
                key="empty"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center text-muted-foreground"
              >
                No encontramos nada con eso. Prueba con “café” o “pan dulce”.
              </motion.p>
            ) : (
              filtered.map((cat) => (
                <motion.div
                  key={cat.id}
                  layout
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6 flex items-baseline justify-between border-b border-foreground/20 pb-3">
                    <h3 className="flex items-center gap-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">
                      <span className="coffee-bean-mark" aria-hidden="true" />
                      {cat.name}
                    </h3>
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {cat.items.length} {cat.items.length === 1 ? "opción" : "opciones"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.items.map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`menu-filter min-h-11 cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function MenuItemCard({ item }: { item: MenuItem }) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1150);
    return () => clearTimeout(timer);
  }, [justAdded]);

  function addToOrder() {
    add(item);
    setJustAdded(true);
    toast.success(`${item.name} ya está en tu pedido.`, {
      action: { label: "Ver pedido", onClick: openCart },
    });
  }

  return (
    <article className="menu-ticket group relative flex flex-col overflow-hidden rounded-sm border border-border border-b-primary/35 bg-card shadow-[0_12px_30px_rgba(70,31,15,0.06)] transition-[border-color,box-shadow] duration-300 hover:border-primary/45 hover:shadow-[0_18px_38px_rgba(70,31,15,0.11)]">
      {/* Image */}
      <div className="relative aspect-[5/4] overflow-hidden bg-secondary">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
        {item.popular && (
          <div className="absolute left-3 top-3">
            <Badge className="border-0 bg-accent text-accent-foreground shadow-md">
              <Flame className="mr-1 h-3 w-3" /> Popular
            </Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-display text-lg font-semibold leading-tight text-foreground">
            {item.name}
          </h4>
          <span className="shrink-0 font-display text-lg font-semibold text-primary">
            {formatMXN(item.price)}
          </span>
        </div>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>

        {item.origin && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-primary/80">
            <span className="h-1 w-1 rounded-full bg-primary" />
            {item.origin}
          </p>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((t) => {
              const meta = TAG_META[t];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <span
                  key={t}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.className}`}
                >
                  {Icon && <Icon className="h-2.5 w-2.5" />}
                  {meta.label}
                </span>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 pt-1">
          <Button
            onClick={addToOrder}
            className="tonalli-press relative min-h-11 w-full cursor-pointer overflow-hidden rounded-md bg-primary/95 text-primary-foreground transition-colors hover:bg-primary"
            size="sm"
            aria-live="polite"
          >
            {justAdded ? (
              <>
                <SteamConfirmation />
                Añadido al pedido
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-4 w-4" />
                Agregar al pedido
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

function SteamConfirmation() {
  return (
    <span className="coffee-add-steam" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}
