"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coffee, Menu, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-store";
import { ThemeToggle } from "./theme-toggle";
import { LivePill } from "./live-pill";

const NAV_LINKS = [
  { href: "#menu", label: "Menú" },
  { href: "#historia", label: "Historia" },
  { href: "#reservar", label: "Reservar" },
  { href: "#ubicacion", label: "Ubicación" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const openCart = useCart((s) => s.open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "glass-warm border-b border-border/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="#inicio"
          className="group flex min-h-11 min-w-0 items-center gap-2 sm:gap-2.5"
          aria-label="Café Tonalli — inicio"
        >
          <span className="tonalli-logo-mark relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105 sm:h-11 sm:w-11">
            <Coffee className="h-4.5 w-4.5" strokeWidth={2.2} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Café Tonalli
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
              CDMX · Roma Norte
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <LivePill />

          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="relative h-11 w-11 hover:bg-secondary/80"
            onClick={openCart}
            aria-label={`Abrir carrito (${count} items)`}
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Button>

          <Button
            asChild
            size="sm"
            className="ml-1 hidden h-11 rounded-full bg-primary px-4 text-primary-foreground shadow-sm hover:bg-primary/90 sm:inline-flex"
          >
            <Link href="#reservar">Reservar</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 md:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] border-border bg-background p-0"
            >
              <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
                <SheetTitle className="font-display text-left text-xl text-foreground">
                  Menú
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-3">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {l.label}
                  </Link>
                ))}
                <Button
                  asChild
                  className="mt-3 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="#reservar" onClick={() => setMobileOpen(false)}>
                    Reservar mesa
                  </Link>
                </Button>
                <div className="mt-4 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Horario hoy</p>
                  <p className="mt-1">Lun–Dom · 07:00 – 22:00</p>
                  <p className="mt-1">Av. Álvaro Obregón 142, Roma Norte</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
