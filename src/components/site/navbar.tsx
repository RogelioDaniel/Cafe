"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coffee, Menu, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-store";
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
      className={`poster-navbar sticky top-0 z-50 w-full ${scrolled ? "is-scrolled" : ""}`}
    >
      <nav className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="#inicio"
          className="group flex min-h-11 min-w-0 items-center gap-2 sm:gap-2.5"
          aria-label="Café Tonalli — inicio"
        >
          <span className="tonalli-logo-mark relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#1d2059] bg-[#f3df4d] text-[#1d2059] shadow-[3px_3px_0_#1d2059] transition-transform group-hover:-rotate-6 group-hover:scale-105 sm:h-11 sm:w-11">
            <Coffee className="h-4.5 w-4.5" strokeWidth={2.2} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="whitespace-nowrap font-display text-sm tracking-[-0.02em] text-[#1d2059] sm:text-base">
              Café Tonalli
            </span>
            <span className="hidden font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#1d2059]/70 sm:block">
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
              className="rounded-full border-2 border-transparent px-3 py-2 text-sm font-extrabold text-[#1d2059] transition-all hover:border-[#1d2059] hover:bg-[#fff8d8]"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <LivePill />

          <Button
            variant="ghost"
            size="icon"
            className="relative h-11 w-11 cursor-pointer text-[#1d2059] hover:bg-[#fff8d8]/60"
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
            className="poster-nav-cta ml-1 hidden h-11 cursor-pointer rounded-lg px-4 font-black sm:inline-flex"
          >
            <Link href="#reservar">Reservar</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 cursor-pointer text-[#1d2059] hover:bg-[#fff8d8]/60 md:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(86vw,320px)] border-l-[3px] border-[#1d2059] bg-[#fff8d8] p-0 text-[#1d2059]"
            >
              <SheetHeader className="border-b-2 border-[#1d2059] bg-[#f3df4d] px-5 pb-3 pt-5">
                <SheetTitle className="font-display text-left text-xl text-[#1d2059]">
                  Menú
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-3">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-lg border-2 border-transparent px-3 py-3 text-base font-extrabold text-[#1d2059] transition-colors hover:border-[#1d2059] hover:bg-[#b9dcff]"
                  >
                    {l.label}
                  </Link>
                ))}
                <Button
                  asChild
                  className="poster-button poster-button--barro mt-3 w-full font-black"
                >
                  <Link href="#reservar" onClick={() => setMobileOpen(false)}>
                    Reservar mesa
                  </Link>
                </Button>
                <div className="mt-4 rounded-xl border-2 border-[#1d2059] bg-[#f5b3e7] p-3 text-xs text-[#1d2059]/75 shadow-[3px_4px_0_#1d2059]">
                  <p className="font-extrabold text-[#1d2059]">Horario hoy</p>
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
