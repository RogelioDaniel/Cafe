"use client";

import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowDownRight, Clock, MapPin, Star } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCafeStats } from "@/hooks/use-cafe-stats";
import { formatNumber } from "@/lib/format";
import {
  TonalliBeanDoodle,
  TonalliCinnamonDoodle,
  TonalliConchaDoodle,
  TonalliCupDoodle,
  TonalliMolinilloDoodle,
  TonalliOllaDoodle,
  TonalliPiloncilloDoodle,
  TonalliTamalDoodle,
  type TonalliDoodleProps,
} from "./tonalli-doodles";
import { usePaperNavigation } from "./paper-navigation";

const CAFE_LETTERS = ["C", "A", "F", "É"];
const TONALLI_LETTERS = ["T", "O", "N", "A", "L", "L", "I"];

const HERO_CHARACTERS = {
  bean: TonalliBeanDoodle,
  cinnamon: TonalliCinnamonDoodle,
  concha: TonalliConchaDoodle,
  cup: TonalliCupDoodle,
  molinillo: TonalliMolinilloDoodle,
  olla: TonalliOllaDoodle,
  piloncillo: TonalliPiloncilloDoodle,
  tamal: TonalliTamalDoodle,
} satisfies Record<string, ComponentType<TonalliDoodleProps>>;

type CharacterId = keyof typeof HERO_CHARACTERS;
type CharacterSlot = "lead" | "left" | "right" | "accent";
type HeroCast = Record<CharacterSlot, CharacterId> & { ariaLabel: string };
type LetterAnimationStyle = CSSProperties & { "--coffee-letter-delay": string };

const HERO_CASTS: HeroCast[] = [
  { lead: "olla", left: "concha", right: "cup", accent: "bean", ariaLabel: "Olla, concha, taza y grano de café caricaturizados" },
  { lead: "molinillo", left: "tamal", right: "piloncillo", accent: "cinnamon", ariaLabel: "Molinillo, tamal, piloncillo y canela caricaturizados" },
  { lead: "cup", left: "bean", right: "concha", accent: "tamal", ariaLabel: "Taza, grano, concha y tamal caricaturizados" },
  { lead: "olla", left: "cinnamon", right: "piloncillo", accent: "molinillo", ariaLabel: "Olla, canela, piloncillo y molinillo caricaturizados" },
  { lead: "molinillo", left: "concha", right: "cup", accent: "bean", ariaLabel: "Molinillo, concha, taza y grano de café caricaturizados" },
  { lead: "cup", left: "tamal", right: "cinnamon", accent: "piloncillo", ariaLabel: "Taza, tamal, canela y piloncillo caricaturizados" },
];

const CHARACTER_SLOTS: CharacterSlot[] = ["lead", "left", "right", "accent"];

export function Hero() {
  const { state } = useCafeStats();
  const sectionRef = useRef<HTMLElement>(null);
  const [castIndex, setCastIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const { navigate } = usePaperNavigation();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 0.12, 0.82], [0, 0, -140]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.52, 0.86], [1, 0.84, 0]);
  const visualY = useTransform(scrollYProgress, [0, 0.1, 0.92], [0, 0, -190]);
  const visualOpacity = useTransform(scrollYProgress, [0, 0.64, 0.94], [1, 0.88, 0]);
  const leadY = useTransform(scrollYProgress, [0, 0.16, 0.9], [0, 0, -115]);
  const leftY = useTransform(scrollYProgress, [0, 0.12, 0.86], [0, 0, -205]);
  const rightY = useTransform(scrollYProgress, [0, 0.14, 0.88], [0, 0, -175]);
  const accentY = useTransform(scrollYProgress, [0, 0.08, 0.82], [0, 0, -235]);

  useEffect(() => {
    const randomValue = new Uint32Array(1);
    window.crypto.getRandomValues(randomValue);
    setCastIndex(randomValue[0] % HERO_CASTS.length);
  }, []);

  const cast = HERO_CASTS[castIndex];

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="tonalli-hero relative isolate overflow-hidden text-[#1d2059]"
    >
      <div className="hero-poster-dots" aria-hidden="true" />
      <span className="hero-spark hero-spark--one" aria-hidden="true" />
      <span className="hero-spark hero-spark--two" aria-hidden="true" />

      <div className="hero-layout relative mx-auto grid max-w-[1440px] items-center gap-8 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
        <motion.div
          className="hero-scroll-layer hero-scroll-layer--copy"
          style={shouldReduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}
        >
        <div className="hero-copy relative z-10 max-w-2xl">
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
                  <span
                    className={`hero-letter hero-letter--${index + 1}`}
                    data-aroma={letter === "É" ? "true" : undefined}
                    key={`${letter}-${index}`}
                    style={{ "--coffee-letter-delay": `${190 + index * 44}ms` } as LetterAnimationStyle}
                  >
                    <span className="hero-letter__glyph">{letter}</span>
                  </span>
                ))}
              </span>
            </span>
            <span className="hero-title-line" aria-hidden="true">
              <span className="hero-letter-row hero-letter-row--tonalli">
                {TONALLI_LETTERS.map((letter, index) => (
                  <span
                    className={`hero-letter hero-letter--${index + 1}`}
                    key={`${letter}-${index}`}
                    style={{ "--coffee-letter-delay": `${390 + index * 44}ms` } as LetterAnimationStyle}
                  >
                    <span className="hero-letter__glyph">{letter}</span>
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
              <Link href="#reservar" onClick={(event) => navigate(event, "#reservar", { label: "Reservar mesa" })}>
                Apartar mesa
                <ArrowDownRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="poster-button poster-button--cream h-12 px-6 text-base font-black">
              <Link href="#menu" onClick={(event) => navigate(event, "#menu", { label: "Explorar la carta" })}>
                Explorar la carta
              </Link>
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
        </motion.div>

        <motion.div
          className="hero-scroll-layer hero-scroll-layer--visual"
          style={shouldReduceMotion ? undefined : { y: visualY, opacity: visualOpacity }}
        >
        <div className="hero-service relative mx-auto w-full max-w-[46rem] lg:justify-self-end">
          <div
            className="hero-cartoon-stage"
            role="img"
            aria-label={`${cast.ariaLabel} como personajes de Café Tonalli`}
          >
            <div className="hero-sunburst" aria-hidden="true" />
            <div className="hero-checker-table" aria-hidden="true" />
            {CHARACTER_SLOTS.map((slot) => {
              const characterId = cast[slot];
              const Character = HERO_CHARACTERS[characterId];
              const characterY = slot === "lead" ? leadY : slot === "left" ? leftY : slot === "right" ? rightY : accentY;
              return (
                <motion.div
                  className={`hero-character hero-character--${slot}`}
                  data-character={characterId}
                  key={`${castIndex}-${slot}-${characterId}`}
                  style={shouldReduceMotion ? undefined : { y: characterY }}
                >
                  <Character className="hero-character__art" />
                </motion.div>
              );
            })}
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
        </motion.div>
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
