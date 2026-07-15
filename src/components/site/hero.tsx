"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCafeStats } from "@/hooks/use-cafe-stats";
import { formatNumber } from "@/lib/format";

export function Hero() {
  const { state } = useCafeStats();

  return (
    <section
      id="inicio"
      className="tonalli-hero relative isolate min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#20100a] text-[#fff5df]"
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_35%,rgba(176,65,27,0.24),transparent_30%),linear-gradient(135deg,#180a06_0%,#2a120b_56%,#160906_100%)]" />
      <div className="hero-weave absolute inset-0 -z-10 opacity-25" />

      <p
        className="pointer-events-none absolute -right-[0.06em] top-[14%] -z-10 hidden select-none font-display text-[clamp(9rem,24vw,23rem)] font-black leading-none tracking-[-0.08em] text-white/[0.025] lg:block"
        aria-hidden="true"
      >
        TONALLI
      </p>

      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-[1440px] items-center gap-12 px-5 pb-16 pt-20 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 lg:px-12 lg:pb-10 lg:pt-12">
        <div className="hero-copy relative z-10 max-w-2xl lg:py-12">
          <div className="hero-reveal hero-reveal--eyebrow flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#e5a263]">
            <span className="h-px w-10 bg-current" />
            Cafetería mexicana de autor
          </div>

          <h1 className="hero-headline mt-7 font-display text-[clamp(3.8rem,9vw,7.8rem)] font-semibold leading-[0.82] tracking-[-0.055em]">
            <span className="hero-title-line"><span>El día</span></span>
            <span className="hero-title-line"><span>empieza</span></span>
            <span className="hero-title-line">
              <span className="font-normal italic text-[#efad68]">en barro.</span>
            </span>
          </h1>

          <p className="hero-reveal hero-reveal--copy mt-8 max-w-xl text-pretty text-lg leading-relaxed text-[#f8ead1]/72 sm:text-xl">
            Café de altura, piloncillo y canela despiertan lento en la olla.
            Antojitos de comal y pan dulce salen cuando el barrio apenas abre
            los ojos.
          </p>

          <div className="hero-reveal hero-reveal--actions mt-9 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="tonalli-press h-12 min-w-44 rounded-md bg-[#d86f35] px-6 text-base font-bold text-[#20100a] shadow-[0_12px_30px_rgba(119,35,10,0.35)] hover:bg-[#eda05e]"
            >
              <Link href="#reservar">
                Apartar mesa
                <ArrowDownRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-md border-[#fff5df]/25 bg-transparent px-6 text-base text-[#fff5df] hover:bg-[#fff5df]/10 hover:text-[#fff5df]"
            >
              <Link href="#menu">Explorar la carta</Link>
            </Button>
          </div>

          <div className="hero-reveal hero-reveal--details mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#fff5df]/12 pt-5 text-sm text-[#f8ead1]/65">
            <span className="inline-flex min-h-11 items-center gap-2">
              <MapPin className="h-4 w-4 text-[#efad68]" />
              Roma Norte, CDMX
            </span>
            <span className="inline-flex min-h-11 items-center gap-2">
              <Clock className="h-4 w-4 text-[#efad68]" />
              Todos los días · 07–22 h
            </span>
            <span className="inline-flex min-h-11 items-center gap-2">
              <Star className="h-4 w-4 fill-[#efad68] text-[#efad68]" />
              4.9 de 5
            </span>
          </div>
        </div>

        <div className="hero-service relative mx-auto w-full max-w-2xl lg:justify-self-end">
          <div className="hero-kitchen-ticket absolute -left-4 top-[14%] z-20 hidden border border-[#fff5df]/18 bg-[#20100a]/82 px-4 py-3 backdrop-blur-sm sm:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#efad68]">
              Receta de la casa
            </p>
            <p className="mt-1 font-display text-xl">Olla · canela · piloncillo</p>
          </div>

          <div className="hero-vessel relative ml-auto aspect-[4/5] w-[88%] overflow-hidden border border-[#fff5df]/16 bg-[#5b2415] shadow-[0_35px_90px_rgba(0,0,0,0.42)] sm:w-[82%] lg:w-[86%]">
            <Image
              src="/images/menu/hero-comal.png"
              alt="Olla de barro con café de olla recién servido"
              fill
              priority
              sizes="(max-width: 1024px) 82vw, 46vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(20,7,4,0.78)_100%)]" />
            <svg
              className="hero-first-steam"
              viewBox="0 0 120 160"
              fill="none"
              aria-hidden="true"
            >
              <path d="M31 154C8 123 55 108 32 78C13 54 49 38 40 8" />
              <path d="M63 154C92 125 47 108 70 80C94 51 57 35 69 4" />
              <path d="M91 153C70 132 103 112 88 91C72 68 99 53 94 25" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5 sm:p-7">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#efad68]">
                  Lote de hoy
                </p>
                <p className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                  Coatepec · 1,200 msnm
                </p>
              </div>
              <span className="shrink-0 border-l border-[#fff5df]/25 pl-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[#fff5df]/60">
                Tueste
                <br />
                medio
              </span>
            </div>
          </div>

          <div className="hero-stats absolute -bottom-7 left-0 z-20 grid w-[min(92%,34rem)] grid-cols-3 border border-[#fff5df]/16 bg-[#170b07]/92 shadow-2xl backdrop-blur-md">
            <HeroStat label="Tazas hoy" value={state?.cups_today ?? 1847} />
            <HeroStat label="Reservas" value={state?.reservations_today ?? 48} />
            <HeroStat
              label="Espera"
              value={`${state?.wait_time_minutes ?? 8} min`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border-r border-[#fff5df]/12 px-3 py-4 last:border-r-0 sm:px-5">
      <div className="font-display text-xl font-semibold tabular-nums text-[#efad68] sm:text-2xl">
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
      <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-[#fff5df]/52 sm:text-[9px]">
        {label}
      </div>
    </div>
  );
}
