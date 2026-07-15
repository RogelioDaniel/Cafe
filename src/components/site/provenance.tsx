"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Sprout, Flame, Hand, Coffee } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: Sprout,
    title: "El cafetal",
    body: "Trabajamos con familias cafetaleras de Coatepec, Pluma Hidalgo y Jaltenango. Café de altura, sombra, cosechado a mano cuando el grano está en su punto.",
    image: "/images/story/cafetal.png",
    caption: "Coatepec, Veracruz · 1,200 msnm",
  },
  {
    n: "02",
    icon: Flame,
    title: "El tueste",
    body: "Tostamos cada lote en pequeñas tandas en olla de barro, despacio, para que el café suelte sus aceites sin amargarse. El olor se siente desde la calle.",
    image: "/images/menu/chocolate.png",
    caption: "Tueste de olla · cada mañana",
  },
  {
    n: "03",
    icon: Hand,
    title: "La mano",
    body: "Masa nixtamalizada en casa, pan dulce laminado a mano, mole molido en metate. Nada industrial, todo al ritmo del oficio mexicano.",
    image: "/images/story/metate.png",
    caption: "Metate de piedra volcánica",
  },
  {
    n: "04",
    icon: Coffee,
    title: "La taza",
    body: "Servimos en barro, como se debe. El café de olla llega a tu mesa humeante, con su canela y su piloncillo. El ritual que cierra el círculo.",
    image: "/images/menu/cafe-de-olla.png",
    caption: "Olla de barro negra de Oaxaca",
  },
];

export function Provenance() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="historia"
      className="provenance-section relative scroll-mt-20 overflow-hidden py-20 text-[#1d2059] sm:py-28"
    >
      {/* Texture */}
      <div className="absolute inset-0 bg-grain-dark opacity-60" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid gap-6 border-b-2 border-[#1d2059]/30 pb-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:text-left">
          <div>
          <p className="inline-flex rounded-full border-2 border-[#1d2059] bg-[#f3df4d] px-3 py-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] shadow-[3px_4px_0_#1d2059]">
            Del metate a la mesa
          </p>
          <h2 className="mt-6 font-display text-4xl leading-[0.96] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
            Cuatro gestos,
            <br />
            <span className="text-[#fff8d8] drop-shadow-[3px_4px_0_#1d2059]">cuatrocientos años.</span>
          </h2>
          </div>
          <div className="max-w-xl lg:justify-self-end">
            <p className="text-pretty text-lg font-semibold leading-relaxed text-[#1d2059]/72">
              No es una cafetería más. Es un ritual que viene desde antes de que
              existiera el café en México: sembrar, tostar, moler y servir como
              una sola historia.
            </p>
            <div className="origin-route-stamp" aria-hidden="true">
              <span>Ruta del lote</span>
              <strong>Coatepec → Roma Norte</strong>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative mt-16 space-y-20 lg:space-y-28">
          <div className="ritual-path" aria-hidden="true" />
          {STEPS.map((step, i) => {
            const reversed = i % 2 === 1;
            return (
              <motion.div
                key={step.n}
                initial={reduceMotion ? false : { opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                data-tone={i}
                className={`relative flex flex-col gap-8 ${
                  reversed ? "lg:flex-row-reverse" : "lg:flex-row"
                } items-center`}
              >
                {/* Image */}
                <div className="provenance-photo relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] border-[3px] border-[#1d2059] lg:w-1/2">
                  <Image
                    src={step.image}
                    alt={step.caption}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-[#1d2059]/88 p-4">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#fff8d8]">
                      {step.caption}
                    </p>
                  </div>
                </div>

                {/* Text */}
                <div className="provenance-copy w-full rounded-[1.5rem] border-[3px] border-[#1d2059] p-6 shadow-[7px_9px_0_#1d2059] lg:w-1/2 lg:p-8">
                  <div className="flex items-center gap-3">
                    <span className="ritual-node flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#1d2059] bg-[#fff8d8] font-mono text-xs font-bold text-[#1d2059] shadow-[3px_4px_0_#1d2059]">
                      {step.n}
                    </span>
                    <step.icon className="h-6 w-6 text-[#1d2059]" strokeWidth={2.7} />
                  </div>
                  <h3 className="mt-4 font-display text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-pretty text-base font-semibold leading-relaxed text-[#1d2059]/72 sm:text-lg">
                    {step.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
