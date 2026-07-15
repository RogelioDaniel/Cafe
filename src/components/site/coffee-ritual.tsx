"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { MousePointer2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CoffeePourScene = dynamic(
  () => import("./coffee-pour-scene").then((mod) => mod.CoffeePourScene),
  { ssr: false }
);

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

const RITUAL_NOTES = [
  ["01", "Barro cocido", "Conserva el calor sin apresurar la taza."],
  ["02", "Vertido lento", "El café cae al ritmo del piloncillo y la canela."],
  ["03", "Último vapor", "Se sirve cuando el aroma ya llegó a la mesa."],
] as const;

export function CoffeeRitual() {
  const sectionRef = useRef<HTMLElement>(null);
  const [sceneAllowed, setSceneAllowed] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData;

    const syncMotionPreference = () => {
      const allowed = !reducedMotion.matches && !saveData;
      setSceneAllowed(allowed);
      if (!allowed) {
        setSceneVisible(false);
        setSceneReady(false);
      }
    };
    syncMotionPreference();
    reducedMotion.addEventListener("change", syncMotionPreference);

    return () => reducedMotion.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !sceneAllowed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSceneVisible(true);
        observer.disconnect();
      },
      { rootMargin: "120px 0px", threshold: 0.2 }
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, [sceneAllowed]);

  return (
    <section
      ref={sectionRef}
      id="ritual-barro"
      aria-labelledby="ritual-title"
      className="coffee-ritual relative overflow-hidden bg-[#2a120b] text-[#fff5df]"
    >
      <div className="coffee-ritual__grain" aria-hidden="true" />
      <div className="coffee-ritual__inner relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16 lg:px-8">
        <div className="relative z-10">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-amber-300">
            La pieza de la casa
          </p>
          <h2
            id="ritual-title"
            className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[0.9] tracking-[-0.04em] sm:text-6xl"
          >
            El barro guarda
            <br />
            <span className="italic text-[#edaa66]">el último calor.</span>
          </h2>
          <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-[#fff5df]/70">
            La taza no es utilería: termina la receta. Su pared de barro mantiene
            el café de olla caliente mientras la canela, el piloncillo y el grano
            de altura se encuentran.
          </p>

          <ol className="mt-10 border-t border-[#fff5df]/14">
            {RITUAL_NOTES.map(([number, title, description]) => (
              <li
                key={number}
                className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-[#fff5df]/14 py-4"
              >
                <span className="pt-1 font-mono text-[10px] text-amber-300">
                  {number}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold">{title}</h3>
                  <p className="mt-1 text-base leading-relaxed text-[#fff5df]/58 sm:text-sm">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div
          className={`coffee-ritual__visual ${sceneReady ? "is-ready" : ""}`}
          role="img"
          aria-label="Taza de barro llenándose con café de olla"
        >
          <Image
            src="/images/menu/cafe-de-olla.png"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="coffee-ritual__fallback object-cover"
          />
          {sceneVisible && <CoffeePourScene onReady={() => setSceneReady(true)} />}
          {sceneAllowed && (
            <div className="coffee-ritual__interaction-hint" aria-hidden="true">
              <MousePointer2 className="h-3.5 w-3.5" />
              Mueve para observar el barro
            </div>
          )}
          <div className="coffee-ritual__annotation coffee-ritual__annotation--top">
            <span>Lote de hoy</span>
            <strong>Coatepec · 1,200 msnm</strong>
          </div>
          <div className="coffee-ritual__annotation coffee-ritual__annotation--bottom">
            <span>Servicio</span>
            <strong>Barro · canela · piloncillo</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
