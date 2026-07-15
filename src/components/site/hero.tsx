"use client";

import Link from "next/link";
import { ArrowDownRight, Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCafeStats } from "@/hooks/use-cafe-stats";
import { formatNumber } from "@/lib/format";
import {
  TonalliBeanDoodle,
  TonalliConchaDoodle,
  TonalliCupDoodle,
  TonalliOllaDoodle,
} from "./tonalli-doodles";

const CAFE_LETTERS = ["C", "A", "F", "É"];
const TONALLI_LETTERS = ["T", "O", "N", "A", "L", "L", "I"];

export function Hero() {
  const { state } = useCafeStats();

  return (
    <section
      id="inicio"
      className="tonalli-hero relative isolate min-h-[calc(100dvh-4rem)] overflow-hidden text-[#1d2059]"
    >
      <div className="hero-poster-dots" aria-hidden="true" />
      <span className="hero-spark hero-spark--one" aria-hidden="true" />
      <span className="hero-spark hero-spark--two" aria-hidden="true" />

      <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-[1440px] items-center gap-8 px-5 pb-14 pt-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:pb-12 lg:pt-10">
        <div className="hero-copy relative z-10 max-w-2xl py-6 lg:py-10">
          <div className="hero-reveal hero-reveal--eyebrow hero-eyebrow-badge">
            <span className="coffee-bean-mark" aria-hidden="true" />
            Café mexicano · Roma Norte
          </div>

          <h1
            className="hero-brand-title mt-6"
            aria-label="Café Tonalli. El día empieza en barro."
          >
            <span className="hero-title-line" aria-hidden="true">
              <span className="hero-letter-row hero-letter-row--cafe">
                {CAFE_LETTERS.map((letter, index) => (
                  <span className={`hero-letter hero-letter--${index + 1}`} key={`${letter}-${index}`}>
                    {letter}
                  </span>
                ))}
              </span>
            </span>
            <span className="hero-title-line" aria-hidden="true">
              <span className="hero-letter-row hero-letter-row--tonalli">
                {TONALLI_LETTERS.map((letter, index) => (
                  <span className={`hero-letter hero-letter--${index + 1}`} key={`${letter}-${index}`}>
                    {letter}
                  </span>
                ))}
              </span>
            </span>
          </h1>

          <p className="hero-reveal hero-reveal--copy hero-tagline mt-6">
            El día empieza <span>en barro.</span>
          </p>
          <p className="hero-reveal hero-reveal--copy mt-4 max-w-xl text-pretty text-base font-semibold leading-relaxed text-[#1d2059]/78 sm:text-lg">
            Café de altura, piloncillo y canela despiertan lento en la olla.
            Antojitos de comal y pan dulce salen cuando el barrio apenas abre
            los ojos.
          </p>

          <div className="hero-reveal hero-reveal--actions mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="tonalli-press poster-button poster-button--barro h-12 min-w-44 px-6 text-base font-black">
              <Link href="#reservar">
                Apartar mesa
                <ArrowDownRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="poster-button poster-button--cream h-12 px-6 text-base font-black">
              <Link href="#menu">Explorar la carta</Link>
            </Button>
          </div>

          <div className="hero-reveal hero-reveal--details mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t-2 border-[#1d2059]/25 pt-4 text-sm font-bold text-[#1d2059]/72">
            <span className="inline-flex min-h-10 items-center gap-2">
              <MapPin className="h-4 w-4" /> Roma Norte, CDMX
            </span>
            <span className="inline-flex min-h-10 items-center gap-2">
              <Clock className="h-4 w-4" /> Todos los días · 07–22 h
            </span>
            <span className="inline-flex min-h-10 items-center gap-2">
              <Star className="h-4 w-4 fill-[#f3df4d]" /> 4.9 de 5
            </span>
          </div>
        </div>

        <div className="hero-service relative mx-auto w-full max-w-[46rem] lg:justify-self-end">
          <div
            className="hero-cartoon-stage"
            role="img"
            aria-label="Olla, taza, concha y grano de café ilustrados como personajes de Café Tonalli"
          >
            <div className="hero-sunburst" aria-hidden="true" />
            <div className="hero-checker-table" aria-hidden="true" />
            <TonalliOllaDoodle className="hero-doodle hero-doodle--olla" />
            <TonalliCupDoodle className="hero-doodle hero-doodle--cup" />
            <TonalliConchaDoodle className="hero-doodle hero-doodle--concha" />
            <TonalliBeanDoodle className="hero-doodle hero-doodle--bean" />
            <div className="hero-kitchen-ticket">
              <p>Receta de la casa</p>
              <strong>Olla · canela · piloncillo</strong>
            </div>
            <div className="hero-lot-sticker">
              <span>Lote de hoy</span>
              <strong>Coatepec</strong>
              <small>1,200 msnm</small>
            </div>
          </div>

          <div className="hero-stats grid grid-cols-3">
            <HeroStat label="Tazas hoy" value={state?.cups_today ?? 1847} />
            <HeroStat label="Reservas" value={state?.reservations_today ?? 48} />
            <HeroStat label="Espera" value={`${state?.wait_time_minutes ?? 8} min`} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="hero-stat px-3 py-3 sm:px-5 sm:py-4">
      <div className="font-display text-lg tabular-nums sm:text-xl">
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
      <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] sm:text-[9px]">
        {label}
      </div>
    </div>
  );
}
