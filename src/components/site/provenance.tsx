"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sprout, Flame, Hand, Coffee } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: Sprout,
    title: "El cafetal",
    body: "Trabajamos con familias cafetaleras de Coatepec, Pluma Hidalgo y Jaltenango. Café de altura, sombra, cosechado a mano cuando el grano está en su punto.",
    image: "/images/menu/hero-comal.png",
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
  return (
    <section
      id="historia"
      className="relative scroll-mt-20 overflow-hidden bg-foreground py-20 text-background sm:py-28"
    >
      {/* Texture */}
      <div className="absolute inset-0 bg-grain-dark opacity-60" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-amber-300">
            Del metate a la mesa
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Cuatro manos,
            <br />
            <span className="italic text-amber-300">cuatrocientos años.</span>
          </h2>
          <p className="mt-4 text-pretty text-base text-background/70">
            No es una cafetería más. Es un ritual que viene desde antes de que
            existiera el café en México, hecho oficio cotidiano.
          </p>
        </div>

        {/* Timeline */}
        <div className="mt-16 space-y-20">
          {STEPS.map((step, i) => {
            const reversed = i % 2 === 1;
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col gap-8 ${
                  reversed ? "lg:flex-row-reverse" : "lg:flex-row"
                } items-center`}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-background/10 shadow-2xl lg:w-1/2">
                  <Image
                    src={step.image}
                    alt={step.caption}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-4">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-background/80">
                      {step.caption}
                    </p>
                  </div>
                </div>

                {/* Text */}
                <div className="w-full lg:w-1/2 lg:px-8">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-5xl font-light text-amber-300/40">
                      {step.n}
                    </span>
                    <step.icon className="h-6 w-6 text-amber-300" />
                  </div>
                  <h3 className="mt-3 font-display text-3xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-pretty text-lg leading-relaxed text-background/75">
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
