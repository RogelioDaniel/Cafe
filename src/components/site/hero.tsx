"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCafeStats } from "@/hooks/use-cafe-stats";
import { formatNumber } from "@/lib/format";

export function Hero() {
  const { state } = useCafeStats();
  const cups = state?.cups_today ?? 0;

  return (
    <section
      id="inicio"
      className="relative isolate overflow-hidden bg-foreground text-background"
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/menu/hero-comal.png"
          alt="Comal de barro con olla de café de olla humeante, canela y piloncillo"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-transparent to-transparent" />
      </div>

      {/* Papel picado banner */}
      <PapelPicadoBanner />

      <div className="mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/80">
              Cafetería de autor · CDMX
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Del metate
            <br />
            a la taza,
            <br />
            <span className="italic text-amber-300">todos los días.</span>
          </h1>

          {/* Sub */}
          <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-background/80 sm:text-xl">
            Café de olla preparado en barro, antojitos de comal y pan dulce
            recién horneado. Un pedacito de México hecho a mano en Colonia
            Roma Norte.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-amber-500 px-7 text-base font-semibold text-foreground shadow-lg shadow-amber-900/30 transition-all hover:bg-amber-400 hover:shadow-xl"
            >
              <Link href="#reservar">
                Reservar mesa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-background/30 bg-background/5 px-7 text-base font-medium text-background backdrop-blur-sm transition-all hover:bg-background/15"
            >
              <Link href="#menu">Ver el menú</Link>
            </Button>
          </div>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-background/70">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-amber-300" />
              Roma Norte, CDMX
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-300" />
              Abierto · 07:00 – 22:00
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
              4.9 · 2,849 reseñas
            </span>
          </div>
        </motion.div>

        {/* Live counter card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <LiveStat label="Tazas servidas hoy" value={cups} accent />
          <LiveStat
            label="Reservas hoy"
            value={state?.reservations_today ?? 0}
          />
          <LiveStat
            label="Tiempo de espera"
            value={`${state?.wait_time_minutes ?? 8} min`}
          />
          <LiveStat
            label="Clientes felices"
            value={state?.happy_customers ?? 0}
          />
        </motion.div>
      </div>

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

function LiveStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 backdrop-blur-md ${
        accent
          ? "border-amber-400/40 bg-amber-500/10"
          : "border-background/15 bg-background/10"
      }`}
    >
      <div
        className={`font-display text-2xl font-semibold tabular-nums sm:text-3xl ${
          accent ? "text-amber-300" : "text-background"
        }`}
      >
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wider text-background/60">
        {label}
      </div>
    </div>
  );
}

/** Animated papel picado banner — the signature decorative moment. */
function PapelPicadoBanner() {
  const colors = [
    "bg-accent",
    "bg-amber-400",
    "bg-primary",
    "bg-amber-500",
    "bg-accent/80",
    "bg-amber-300",
    "bg-primary/80",
    "bg-amber-400",
  ];
  return (
    <div
      className="absolute left-0 right-0 top-16 z-10 flex justify-between px-1 opacity-90"
      aria-hidden="true"
    >
      {colors.map((c, i) => (
        <div
          key={i}
          className={`animate-papel h-10 w-8 ${c}`}
          style={{
            animationDelay: `${i * 0.25}s`,
            clipPath:
              "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)",
          }}
        />
      ))}
    </div>
  );
}
